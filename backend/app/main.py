from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

from app.api.endpoints import (
    auth, tenants, properties, payments, 
    maintenance, dashboard, documents, reports,
    notifications, interaction, monitoring, arrears,
    utilities, messages, leases
)
from datetime import datetime, timezone
from app.core.database import engine, Base, AsyncSessionLocal, ensure_tables
from app.config import settings
from fastapi.responses import PlainTextResponse
from app.tasks.scheduler import start_scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle startup and shutdown events
    """
    is_vercel = os.environ.get("VERCEL")
    auto_create_tables = os.getenv("AUTO_CREATE_TABLES", "true").lower() not in ("0", "false", "no")

    # Startup
    logger.info(f"Starting up Rental Management System (Vercel: {is_vercel})...")
    
    try:
        # Create missing database tables. This is idempotent (existing tables
        # are never modified) and also runs on Vercel so a fresh Neon database
        # is populated automatically on the first request.
        if auto_create_tables:
            logger.info("Ensuring database tables exist...")
            await ensure_tables()
        else:
            logger.info("AUTO_CREATE_TABLES is disabled; skipping schema check.")

        if not is_vercel:
            # Start background scheduler
            logger.info("Starting background scheduler...")
            scheduler = start_scheduler()
            
            # Schedule DB backup (simulated every hour for demo)
            from app.tasks.backup import run_backup
            from app.tasks.reminders import send_rent_reminders
            scheduler.add_job(run_backup, 'interval', hours=24)
            scheduler.add_job(send_rent_reminders, 'interval', days=1)
            
            app.state.scheduler = scheduler
        else:
            logger.info("Vercel environment detected. Background scheduler disabled.")
            
        logger.info("Application lifespan startup complete")
    except Exception as e:
        logger.error(f"Error during lifespan startup: {str(e)}", exc_info=True)
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    if hasattr(app.state, 'scheduler'):
        app.state.scheduler.shutdown()
    await engine.dispose()
    logger.info("Application shutdown complete")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Rental Management System for Landlords",
    lifespan=lifespan
)

# Configure CORS - strict allowlist only, no wildcard origin regex
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Add security headers to prevent clickjacking, MIME sniffing, etc."""
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.DEPLOYMENT_ENV.lower() != "development":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; base-uri 'self'"
    return response

# Security: hide /admin and /landlord routes. They are only served behind the
# Next.js frontend now; the raw HTML fallback pages are removed from public
# serving. This prevents search engines and scanners from discovering admin paths.
@app.middleware("http")
async def hide_admin_paths(request: Request, call_next):
    """Return 404 for admin/landlord paths unless routed by the frontend."""
    path = request.url.path
    if path.startswith("/admin") or path.startswith("/landlord"):
        # Allow API calls through (token-protected already)
        if not path.startswith("/api/"):
            raise HTTPException(status_code=404, detail="Not found")
    return await call_next(request)

# Add middleware to detect portal type based on port or hostname
@app.middleware("http")
async def detect_portal_type(request, call_next):
    """
    Detect which portal is being accessed based on hostname/port or environment.
    Tenant: Port 8000 (default)
    Landlord: Port 8001
    Admin: Port 8002
    """
    host = request.headers.get("host", "localhost")
    port = host.split(":")[-1] if ":" in host else "80"
    
    # Map port to portal type
    if port == str(settings.LANDLORD_PORT) or settings.DEPLOYMENT_ENV == "landlord":
        request.state.portal = "landlord"
    elif port == str(settings.ADMIN_PORT) or settings.DEPLOYMENT_ENV == "admin":
        request.state.portal = "admin"
    else:
        request.state.portal = "tenant"
    
    response = await call_next(request)
    response.headers["X-Portal-Type"] = request.state.portal
    return response

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(properties.router, prefix=f"{settings.API_V1_STR}/properties", tags=["Properties"])
app.include_router(tenants.router, prefix=f"{settings.API_V1_STR}/tenants", tags=["Tenants"])
app.include_router(payments.router, prefix=f"{settings.API_V1_STR}/payments", tags=["Payments"])
app.include_router(maintenance.router, prefix=f"{settings.API_V1_STR}/maintenance", tags=["Maintenance"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["Documents"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications"])
app.include_router(interaction.router, prefix=f"{settings.API_V1_STR}/interactions", tags=["Interactions"])
app.include_router(monitoring.router, prefix=f"{settings.API_V1_STR}/monitoring", tags=["Monitoring"])
app.include_router(arrears.router, prefix=f"{settings.API_V1_STR}/arrears", tags=["Arrears"])
app.include_router(utilities.router, prefix=f"{settings.API_V1_STR}/utilities", tags=["Utilities"])
app.include_router(messages.router, prefix=f"{settings.API_V1_STR}/messages", tags=["Messages"])
app.include_router(leases.router, prefix=f"{settings.API_V1_STR}/leases", tags=["Leases"])

# Admin Router (New)
from app.api.endpoints import admin, users
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])

@app.get(f"{settings.API_V1_STR}/cron/rent-reminders")
async def trigger_reminders():
    """Triggered by Vercel Cron to send daily reminders"""
    from app.tasks.reminders import send_rent_reminders
    await send_rent_reminders()
    return {"status": "reminders_sent", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/v1/ping")
async def ping():
    """Simple database-free ping to verify connectivity"""
    logger.debug("Ping endpoint reached")
    return {"status": "pong", "timestamp": datetime.now(timezone.utc).isoformat()}


handler = app

@app.get("/robots.txt")
async def robots_txt():
    """Serve robots.txt to block crawling of admin/landlord/api paths."""
    robots_content = (
        "User-agent: *\n"
        "Disallow: /admin\n"
        "Disallow: /landlord\n"
        "Disallow: /api/\n"
        "Disallow: /docs\n"
        "Disallow: /redoc\n"
        "Disallow: /openapi.json\n"
        "Sitemap: https://tuiyabelong.com/sitemap.xml\n"
    )
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(content=robots_content)


@app.get("/sitemap.xml")
async def sitemap_xml():
    """Serve sitemap.xml for search engines."""
    base_url = "https://tuiyabelong.com"
    sitemap_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{base_url}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>{base_url}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{base_url}/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{base_url}/dashboard</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>{base_url}/landlord/dashboard</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>{base_url}/admin/dashboard</loc>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>'''
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(content=sitemap_content, media_type="application/xml")


# Note: Frontend is served by Next.js (Vercel edge network).
# This backend only handles API routes. Static file serving is disabled.
# If you need to serve built Next.js output from here, mount the .next/static folder.

if __name__ == "__main__":
    import uvicorn
    
    port = settings.TENANT_PORT  # Default
    if settings.DEPLOYMENT_ENV == "landlord":
        port = settings.LANDLORD_PORT
    elif settings.DEPLOYMENT_ENV == "admin":
        port = settings.ADMIN_PORT
    
    print(f"\n{'='*60}")
    print(f" Starting RMS on port {port} ({settings.DEPLOYMENT_ENV.upper()} Portal)")
    print(f"{'='*60}\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port)