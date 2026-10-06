# backend/app/core/database.py
import logging
import os
from typing import AsyncGenerator

from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

from app.config import settings

logger = logging.getLogger(__name__)

if not settings.ASYNC_DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in Environment Variables")

# Serverless / pooled endpoints (Vercel, Neon, Supabase pooler) do not work
# with a long-lived connection pool: every cold start gets a fresh process and
# the pooler expects short-lived connections.
is_pooler = any(
    marker in settings.ASYNC_DATABASE_URL
    for marker in ("pooler.supabase.com", "neon.tech", ".pooler.")
)
pool_class = NullPool if (os.getenv("VERCEL") or is_pooler) else None

engine_kwargs = {
    "echo": settings.DB_ECHO,
}

if settings.ASYNC_DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update({
        "connect_args": {"check_same_thread": False},
        "poolclass": NullPool,
    })
else:
    # URL query parameters reach asyncpg as strings, but the driver expects
    # integers for its statement caches. Passing them via connect_args keeps
    # prepared statements disabled, which pgBouncer/Neon's pooler requires.
    engine_kwargs["connect_args"] = {
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
    if pool_class:
        engine_kwargs["poolclass"] = pool_class
    else:
        engine_kwargs.update({
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "pool_recycle": 3600,
        })

logger.info("Creating async database engine")
engine = create_async_engine(settings.ASYNC_DATABASE_URL, **engine_kwargs)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def _is_duplicate_table_error(exc: BaseException) -> bool:
    """Detect "relation/table already exists" raised by a concurrent creator."""
    seen = set()
    current: BaseException | None = exc
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        if getattr(current, "pgcode", None) == "42P07":
            return True
        if "already exists" in str(current).lower():
            return True
        current = current.__cause__ or current.__context__
    return False


async def ensure_tables() -> bool:
    """
    Idempotently create any missing tables.

    A single inspector query tells us whether the schema already exists, so the
    normal case costs one round trip; only when tables are missing does it run
    `create_all(checkfirst=True)`. Existing tables are never modified, and a
    race between two cold starts is retried. Returns True when the schema
    exists.
    """
    from app.models import import_all_models

    import_all_models()

    last_error: BaseException | None = None
    attempts = 3
    for attempt in range(1, attempts + 1):
        try:
            async with engine.begin() as conn:
                existing = set(
                    await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names())
                )
                missing = [
                    table
                    for name, table in Base.metadata.tables.items()
                    if name not in existing
                ]
                if missing:
                    logger.info("Creating %s missing table(s)...", len(missing))
                    await conn.run_sync(
                        lambda sync_conn: Base.metadata.create_all(
                            bind=sync_conn, tables=missing, checkfirst=True
                        )
                    )
            logger.info("Database schema is up to date")
            return True
        except Exception as exc:  # driver-specific exception types vary
            last_error = exc
            if not _is_duplicate_table_error(exc) or attempt == attempts:
                break
            logger.warning(
                "Concurrent table creation detected, retrying (%s/%s)",
                attempt,
                attempts,
            )

    logger.error("Failed to create database tables: %s", last_error)
    return False


async def init_db():
    """
    Initialize database with default data
    """
    if not await ensure_tables():
        raise RuntimeError("Could not initialize database schema")

    logger.info("Database initialized successfully")