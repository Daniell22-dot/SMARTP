# Rental Management System (RMS)

A production-ready rental property management platform for Kenyan landlords. Built with a modern hybrid architecture: **Next.js 14 frontend** + **FastAPI backend**, deployed on **Vercel** with **Neon PostgreSQL (serverless)**.

## Overview

Complete rental management for single landlords managing multiple properties:

- **Tenant Portal** — Self-service: view property, pay rent (M-Pesa QR + verification), report maintenance, messages, documents
- **Landlord Portal** — Dashboard, tenant management, payments tracking, maintenance, utilities (water/WiFi), financial reports
- **Admin Portal** — System overview, tenant/property management, finance (KRA tax), system health

## Technical Stack

### Frontend (Next.js 14)
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + custom design system
- **State**: Zustand + React Hook Form + Zod validation
- **Auth**: JWT with HttpOnly cookies, route guards, middleware
- **UI Components**: Custom accessible components (Button, Card, Modal, Table, Forms)

### Backend (FastAPI)
- **Framework**: FastAPI (async) + Python 3.11+
- **ORM**: SQLAlchemy 2.0 (async) + asyncpg
- **Database**: PostgreSQL (Neon serverless, pooled connection)
- **Auth**: JWT (HS256) + bcrypt, rate limiting, secure password reset
- **Payments**: M-Pesa (Safaricom) QR + manual verification
- **AI**: DeepSeek for financial narratives

### Infrastructure
- **Deployment**: Vercel (hybrid: Next.js edge + Python serverless functions)
- **Database**: Neon PostgreSQL (serverless)
- **Email**: SMTP (Gmail) for notifications/password reset
- **Security**: CSP, HSTS, X-Frame-Options, robots.txt, sitemap.xml

## Project Structure

```text
RMS/
├── api/                    # Vercel serverless entry point
│   └── main.py            # Bridges to backend/app/main.py
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── api/endpoints/ # API routes (auth, users, properties, payments, etc.)
│   │   ├── core/          # Config, database, security, email
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic (AI, payments)
│   │   └── tasks/         # Background jobs (reminders, backup)
│   ├── requirements.txt
│   └── .env               # Local env (gitignored)
├── frontend/               # Next.js 14 application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── login/register/    # Auth pages
│   │   │   ├── dashboard/         # Tenant portal
│   │   │   ├── my-property/
│   │   │   ├── payments/          # M-Pesa QR + verify
│   │   │   ├── maintenance/
│   │   │   ├── landlord/          # Landlord portal
│   │   │   │   ├── dashboard/
│   │   │   │   ├── tenants/
│   │   │   │   ├── payments/
│   │   │   │   ├── maintenance/
│   │   │   │   ├── utilities/
│   │   │   │   ├── reports/
│   │   │   │   └── messages/
│   │   │   └── admin/             # Admin portal
│   │   │       ├── dashboard/
│   │   │       ├── tenants/
│   │   │       ├── properties/
│   │   │       ├── finance/
│   │   │       ├── maintenance/
│   │   │       └── system/
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # API client, auth storage, utils
│   │   ├── context/       # React context (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript types (matches backend)
│   │   └── middleware.ts  # Route protection
│   ├── public/            # manifest.json, favicon, icons
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
├── vercel.json             # Vercel routing (API → Python, Frontend → Next.js)
├── requirements.txt        # Python dependencies
└── README.md
```

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (Neon serverless or a local instance)

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit with your Neon database credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local # Edit NEXT_PUBLIC_API_URL if needed
npm run dev                # Runs on http://localhost:3000
```

### Environment Variables

**Backend (`backend/.env`)**:
```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
SECRET_KEY=your-32-char-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
DEPLOYMENT_ENV=development
ADMIN_PORTAL_ACCESS_KEY=your-admin-key
ADMIN_PORTAL_PASSWORD=your-admin-password
LANDLORD_PORTAL_ACCESS_KEY=your-landlord-key
LANDLORD_PORTAL_PASSWORD=your-landlord-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password
MAIL_FROM=your@gmail.com
FRONTEND_URL=http://localhost:3000
MPESA_SHORTCODE=...
MPESA_PASSKEY=...
DEEPSEEK_API_KEY=...
```

**Frontend (`frontend/.env.local`)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Security Features

- **No backdoor tokens** — removed hardcoded admin/landlord tokens
- **Privilege escalation fixed** — registration forces `role=tenant`
- **Security headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **CORS** — strict allowlist (no `*.vercel.app` wildcard)
- **robots.txt** — blocks `/admin`, `/landlord`, `/api/`, `/docs`
- **sitemap.xml** — auto-generated for SEO
- **Rate limiting** — exponential backoff on auth endpoints
- **Password reset** — secure token-based flow with email
- **No default secrets** — fails at startup if `SECRET_KEY` not set

## Deployment (Vercel)

### 1. Connect Repository
Import the repo in Vercel. It will auto-detect the hybrid setup.

### 2. Environment Variables (Vercel Dashboard)
Set these for the **Python function** (backend):
```
DATABASE_URL=postgresql://...
SECRET_KEY=...
ADMIN_PORTAL_ACCESS_KEY=...
ADMIN_PORTAL_PASSWORD=...
LANDLORD_PORTAL_ACCESS_KEY=...
LANDLORD_PORTAL_PASSWORD=...
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
MAIL_FROM=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...
DEEPSEEK_API_KEY=...
VERCEL=1
```

Set these for the **Next.js build** (frontend):
```
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
NEXT_PUBLIC_FRONTEND_URL=https://your-project.vercel.app
```

### 3. vercel.json Routing
- `/api/v1/*` → Python serverless function (`api/main.py`)
- `/api/*` → Python serverless function
- `/health`, `/robots.txt`, `/sitemap.xml` → Python
- All other routes → Next.js (edge)

### 4. Database
Uses **Neon PostgreSQL** (serverless). The schema is created automatically on
startup via `ensure_tables` in `backend/app/core/database.py` (set
`AUTO_CREATE_TABLES=0` to disable). The pooler connection string is normalized
for asyncpg in `backend/app/config.py`, so `sslmode`/`channel_binding` in the
URL are handled transparently.

## API Endpoints

Base: `/api/v1`

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/portal-login`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/me` |
| Users | `GET /users/contacts`, `POST/GET/DELETE /users/profile-photo` |
| Properties | `GET /properties`, `GET /properties/my` |
| Tenants | `GET /tenants/available-units`, `POST /tenants/assign-room`, `GET /tenants/my-status` |
| Payments | `GET /payments/my`, `GET /payments/all`, `GET /payments/recent`, `POST /payments/verify-mpesa` |
| Maintenance | `GET /maintenance/my`, `GET /maintenance/all`, `POST /maintenance`, `PUT /maintenance/{id}/status` |
| Utilities | `POST /utilities`, `GET /utilities`, `GET /utilities/profit-summary`, `GET /utilities/statement/{unit_id}`, `PUT/DELETE /utilities/{id}` |
| Notifications | `GET /notifications`, `POST /notifications`, `PUT /notifications/{id}/read` |
| Messages | `GET /messages/inbox`, `GET /messages/sent`, `POST /messages`, `PUT/DELETE /messages/{id}` |
| Documents | `GET /documents/my`, `GET /documents` |
| Admin | `GET /admin/stats`, `GET /admin/tenants`, `GET /admin/tenants/{id}`, `DELETE /admin/tenants/{id}`, `GET /admin/public-stats` |

## License

MIT License — see [LICENSE.md](LICENSE.md)