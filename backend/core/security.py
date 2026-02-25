"""
core/security.py — JWT token creation, decoding, and auth helpers.
Extracted from main.py to keep business logic out of route handlers.
"""
from datetime import datetime, timedelta, timezone

from fastapi import Header, HTTPException
from jose import JWTError, jwt
from passlib.context import CryptContext

from core.config import JWT_ALGORITHM, JWT_EXPIRE_HOURS, JWT_SECRET_KEY
from services.db import supabase

# ─── Password hashing ─────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ─── JWT helpers ──────────────────────────────────────────────────────────────
def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": _now_utc() + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT; raises 401 HTTPException on failure."""
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc


# ─── Auth dependencies ─────────────────────────────────────────────────────────
def get_optional_auth_user(authorization: str | None = Header(default=None)) -> dict | None:
    """
    Soft auth dependency — returns the user row if a valid Bearer token is
    provided, otherwise returns None (does NOT raise).
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = decode_token(token)
    except HTTPException:
        return None
    user_id = claims.get("sub")
    if not user_id:
        return None
    try:
        result = supabase.table("users").select("*").eq("id", user_id).limit(1).execute()
        return result.data[0] if result.data else None
    except Exception:
        return None


def get_required_auth_user(authorization: str | None = Header(default=None)) -> dict:
    """
    Hard auth dependency — raises 401 if token is missing or invalid.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")
    token = authorization.split(" ", 1)[1].strip()
    claims = decode_token(token)
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    try:
        result = supabase.table("users").select("*").eq("id", user_id).limit(1).execute()
        row = result.data[0] if result.data else None
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"User lookup failed: {exc}") from exc
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return row
