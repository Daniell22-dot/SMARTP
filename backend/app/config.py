# backend/app/config.py
import os
from functools import lru_cache
from pathlib import Path
from urllib.parse import parse_qsl, urlencode

from pydantic_settings import BaseSettings
from pydantic import ValidationError, Field
from typing import Optional, List
import logging
import sys
import secrets as _secrets


def _env_or_default(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(name)
    if value is None or value == "":
        return default
    return value

logger = logging.getLogger(__name__)

# SQLAlchemy's asyncpg dialect forwards every URL query parameter to
# asyncpg.connect() as a keyword argument. asyncpg only accepts its own
# parameter names (e.g. ssl=, not libpq's sslmode=), so libpq-style
# parameters coming from providers such as Neon, Supabase or Fly.io have to
# be translated here or the driver fails with
# "TypeError: connect() got an unexpected keyword argument 'sslmode'".
_ASYNCPG_CONNECT_KWARGS = {
    "host",
    "port",
    "user",
    "password",
    "database",
    "passfile",
    "service",
    "servicefile",
    "timeout",
    "command_timeout",
    "statement_cache_size",
    "max_cached_statement_lifetime",
    "max_cacheable_statement_size",
    "ssl",
    "direct_tls",
    "target_session_attrs",
    "krbsrvname",
    "gsslib",
    # handled by SQLAlchemy's asyncpg dialect before reaching asyncpg
    "prepared_statement_cache_size",
    "async_fallback",
}

# Query parameters asyncpg only understands inside a DSN string, or not at all.
_UNMAPPABLE_URL_PARAMS = {
    "sslmode",
    "sslcert",
    "sslkey",
    "sslrootcert",
    "sslcrl",
    "sslpassword",
    "sslnegotiation",
    "ssl_min_protocol_version",
    "ssl_max_protocol_version",
    "channel_binding",
    "server_settings",
}


def _normalize_asyncpg_query(url: str) -> str:
    """Rewrite URL query parameters into arguments asyncpg.connect() accepts."""
    base, sep, query = url.partition("?")
    if not sep:
        return url

    original = parse_qsl(query, keep_blank_values=True)
    rewritten = []
    seen = {key for key, _ in original}

    for key, value in original:
        if key == "sslmode":
            if "ssl" not in seen:
                rewritten.append(("ssl", value))
                seen.add("ssl")
            continue
        if key in _UNMAPPABLE_URL_PARAMS:
            logger.warning(
                "Ignoring URL parameter %r: not supported by asyncpg. "
                "Configure it via connect_args instead.",
                key,
            )
            continue
        if key not in _ASYNCPG_CONNECT_KWARGS:
            logger.warning(
                "Ignoring unknown database URL parameter %r (asyncpg.connect "
                "would reject it as an unexpected keyword argument).",
                key,
            )
            continue
        rewritten.append((key, value))

    if rewritten == original:
        return url

    return f"{base}{sep}{urlencode(rewritten)}"


@lru_cache(maxsize=8)
def _async_database_url(url: str) -> str:
    """Turn a provider connection string into an asyncpg-compatible driver URL."""
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    if url.startswith("postgresql+asyncpg://"):
        url = _normalize_asyncpg_query(url)

    # Prepared-statement caches must stay disabled against pooled serverless
    # endpoints (Neon / Supabase pooler / pgbouncer in transaction mode).
    _, _, existing_query = url.partition("?")
    existing_keys = {
        key for key, _ in parse_qsl(existing_query, keep_blank_values=True)
    }

    for key, value in (
        ("prepared_statement_cache_size", "0"),
        ("statement_cache_size", "0"),
    ):
        if key not in existing_keys:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}{key}={value}"

    return url


class Settings(BaseSettings):
    PROJECT_NAME: str = "Rental Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Server configuration with port-based separation
    TENANT_PORT: int = int(os.getenv("TENANT_PORT", "8000"))
    LANDLORD_PORT: int = int(os.getenv("LANDLORD_PORT", "8001"))
    ADMIN_PORT: int = int(os.getenv("ADMIN_PORT", "8002"))
    DEPLOYMENT_ENV: str = os.getenv("DEPLOYMENT_ENV", "development")

    PUBLIC_BASE_URL: Optional[str] = os.getenv("PUBLIC_BASE_URL")

    # Frontend URL (used for password reset links)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://tuiyabelong.com")

    BACKEND_CORS_ORIGINS: List[str] = [
        "https://tuiyabelong.vercel.app",
        "https://rental-sigma-five.vercel.app",
        "https://tuiyabelong.com",
        "https://www.tuiyabelong.com",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:8002",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8001",
        "http://127.0.0.1:8002",
        # Vercel preview deployments
        "https://tuiyabelong-git-main.vercel.app",
        "https://tuiyabelong-git-develop.vercel.app",
        "https://rental-sigma-five-git-main.vercel.app",
        "https://rental-sigma-five-git-develop.vercel.app",
    ]

    # Database
    DATABASE_URL: Optional[str] = Field(default_factory=lambda: _env_or_default("DATABASE_URL"))

    @property
    def ASYNC_DATABASE_URL(self) -> Optional[str]:
        if not self.DATABASE_URL:
            project_root = Path(__file__).resolve().parents[2]
            db_path = project_root / "rms_dev.sqlite3"
            return f"sqlite+aiosqlite:///{db_path.as_posix()}"

        return _async_database_url(self.DATABASE_URL.strip())

    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 40

    # JWT (REQUIRED)
    SECRET_KEY: Optional[str] = Field(default_factory=lambda: _env_or_default("SECRET_KEY"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

    # Portal Login Credentials (Admin & Landlord portals)
    ADMIN_PORTAL_EMAIL: str = os.getenv("ADMIN_PORTAL_EMAIL", "admin@tuiyabelong.com")
    LANDLORD_PORTAL_EMAIL: str = os.getenv("LANDLORD_PORTAL_EMAIL", "landlord@tuiyabelong.com")
    ADMIN_PORTAL_ACCESS_KEY: str = os.getenv("ADMIN_PORTAL_ACCESS_KEY", "2026")
    ADMIN_PORTAL_PASSWORD: str = os.getenv("ADMIN_PORTAL_PASSWORD", "admin@2026")
    LANDLORD_PORTAL_ACCESS_KEY: str = os.getenv("LANDLORD_PORTAL_ACCESS_KEY", "2026")
    LANDLORD_PORTAL_PASSWORD: str = os.getenv("LANDLORD_PORTAL_PASSWORD", "landlord@2026")

    # Email (Mapped to .env)
    SMTP_PORT: Optional[int] = os.getenv("SMTP_PORT")
    SMTP_SERVER: Optional[str] = os.getenv("SMTP_SERVER")
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    MAIL_FROM: Optional[str] = os.getenv("MAIL_FROM")
    MAIL_FROM_NAME: Optional[str] = os.getenv("MAIL_FROM_NAME")

    # MPESA
    MPESA_SHORTCODE: Optional[str] = os.getenv("MPESA_SHORTCODE")
    MPESA_PASSKEY: Optional[str] = os.getenv("MPESA_PASSKEY")
    MPESA_CONSUMER_KEY: Optional[str] = os.getenv("MPESA_CONSUMER_KEY")
    MPESA_CONSUMER_SECRET: Optional[str] = os.getenv("MPESA_CONSUMER_SECRET")
    MPESA_CALLBACK_URL: Optional[str] = os.getenv("MPESA_CALLBACK_URL")
    MPESA_ENVIRONMENT: str = os.getenv("MPESA_ENVIRONMENT", "sandbox")

    # DeepSeek AI
    DEEPSEEK_API_KEY: Optional[str] = os.getenv("DEEPSEEK_API_KEY")

    class Config:
        env_file = ".env" if not os.getenv("TESTING") else None
        extra = "ignore"
        case_sensitive = False

    def __init__(self, **data):
        super().__init__(**data)
        self._validate_required_settings()

    def _validate_required_settings(self):
        """Log configuration issues without blocking local development startup."""
        warnings = []

        if not self.SECRET_KEY:
            if self.DEPLOYMENT_ENV.lower() != "development":
                raise RuntimeError(
                    "SECRET_KEY must be set. Generate one with `python -c \"import secrets; print(secrets.token_hex(32))\"`"
                )
            warnings.append("SECRET_KEY not configured; falling back to a generated dev key")
            self.SECRET_KEY = _secrets.token_hex(32)

        if not self.DATABASE_URL:
            warnings.append("DATABASE_URL not configured; using local SQLite fallback")

        if warnings:
            logger.warning("Configuration warnings:")
            for warning in warnings:
                logger.warning(f"  - {warning}")


try:
    settings = Settings()
except ValidationError as e:
    logger.error("Failed to load settings:", exc_info=True)
    sys.exit(1)
