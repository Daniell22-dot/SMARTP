import asyncio
import importlib
import os
import sys
from pathlib import Path

# Set TESTING before importing Settings to prevent loading .env file
os.environ["TESTING"] = "1"

from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import Settings
import pytest


def test_settings_fall_back_to_local_sqlite_and_generated_secret(monkeypatch):
    """Test that settings falls back to SQLite and generates a secret key when not configured."""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("SECRET_KEY", raising=False)

    settings = Settings()

    # Should generate a 64-char hex key (32 bytes = 64 hex chars)
    assert len(settings.SECRET_KEY) == 64
    assert all(c in "0123456789abcdef" for c in settings.SECRET_KEY.lower())
    assert settings.ASYNC_DATABASE_URL.startswith("sqlite+aiosqlite")


def test_settings_ignore_legacy_env_placeholders(monkeypatch):
    """Test that legacy env placeholders don't cause issues."""
    monkeypatch.setenv("JWT_SECRET", "your jwt secret")
    monkeypatch.setenv("JWT_EXPIRES_IN", "30minutes")
    monkeypatch.setenv("PORT", "your server port (e.g. 3000)")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("SECRET_KEY", raising=False)

    settings = Settings()

    # Should generate a valid hex key
    assert len(settings.SECRET_KEY) == 64
    assert all(c in "0123456789abcdef" for c in settings.SECRET_KEY.lower())
    assert settings.ASYNC_DATABASE_URL.startswith("sqlite+aiosqlite")


def test_settings_require_secret_in_production(monkeypatch):
    """Test that SECRET_KEY is required in production."""
    monkeypatch.setenv("DEPLOYMENT_ENV", "production")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("SECRET_KEY", raising=False)

    try:
        Settings()
        assert False, "Should have raised RuntimeError"
    except RuntimeError as e:
        assert "SECRET_KEY must be set" in str(e)


@pytest.mark.skipif(
    sys.version_info >= (3, 13),
    reason="aiosqlite create_function issue with Python 3.13+"
)
def test_sqlite_fallback_session_factory_and_init_db(monkeypatch):
    """Test that SQLite fallback works with session factory and init_db."""
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("SECRET_KEY", raising=False)

    sys.modules.pop("app.core.database", None)
    sys.modules.pop("app.config", None)

    import app.core.database as database_module
    database_module = importlib.reload(database_module)

    async def _run():
        async with database_module.AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        await database_module.init_db()

    asyncio.run(_run())