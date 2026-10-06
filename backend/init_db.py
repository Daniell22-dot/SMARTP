import asyncio
import os
import sys
import traceback
from urllib.parse import urlsplit

from dotenv import load_dotenv

# Add the parent directory to sys.path to allow imports from 'app'
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

# Load environment variables from .env (repo root first, backend/.env wins)
root_dir = os.path.dirname(backend_dir)
load_dotenv(os.path.join(root_dir, ".env"))
dotenv_path = os.path.join(backend_dir, ".env")
if os.path.exists(dotenv_path):
    print(f"Loading environment from {dotenv_path}")
    load_dotenv(dotenv_path, override=True)

from app.core.database import ensure_tables, engine
from app.config import settings


def _redact(url: str) -> str:
    """Hide credentials before printing a connection string."""
    try:
        parts = urlsplit(url)
        if "@" in parts.netloc:
            host = parts.netloc.rsplit("@", 1)[1]
            netloc = f"***:***@{host}"
        else:
            netloc = parts.netloc
        return parts._replace(netloc=netloc).geturl()
    except Exception:
        return "<unparseable url>"


async def initialize_database():
    print(f"Database: {_redact(settings.ASYNC_DATABASE_URL)}")

    try:
        created = await ensure_tables()
        if created:
            print("Database initialization complete!")
        else:
            print("Database initialization failed - see errors above.")
            sys.exit(1)
    except Exception as e:
        print(f"Error initializing database: {e}")
        traceback.print_exc()
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(initialize_database())
