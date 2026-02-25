"""
core/config.py — Centralized application settings.
All environment variables are loaded here once and reused everywhere.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load from backend/.env regardless of working directory
_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=True, encoding="utf-8-sig")


def _get(key: str, default: str = "") -> str:
    """Read an env var, stripping whitespace/CRLF (Windows safety)."""
    return (os.getenv(key) or default).strip()


# ─── Supabase ────────────────────────────────────────────────────────────────
SUPABASE_URL: str = _get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY: str = _get("SUPABASE_SERVICE_ROLE_KEY")

# ─── JWT ─────────────────────────────────────────────────────────────────────
JWT_SECRET_KEY: str = _get("JWT_SECRET_KEY", "demo-dev-secret-change-me")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRE_HOURS: int = 24

# ─── Groq ─────────────────────────────────────────────────────────────────────
GROQ_API_KEY: str = _get("GROQ_API_KEY")

# ─── Twilio ───────────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID: str = _get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN: str = _get("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER: str = _get("TWILIO_PHONE_NUMBER")
TWILIO_MESSAGING_SERVICE_SID: str = _get("TWILIO_MESSAGING_SERVICE_SID")

# ─── CORS ─────────────────────────────────────────────────────────────────────
_origins = _get("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _origins.split(",") if o.strip()]

# Add specific Frontend URL if provided
FRONTEND_URL: str = _get("FRONTEND_URL")
if FRONTEND_URL and FRONTEND_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(FRONTEND_URL)
