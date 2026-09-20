import psycopg
from fastapi import APIRouter

from app.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint with database connectivity verification."""
    db_status = "disconnected"
    try:
        conn = psycopg.connect(settings.database_url, connect_timeout=3)
        conn.execute("SELECT 1")
        conn.close()
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "ok",
        "db": db_status,
        "service": "analytics",
    }
