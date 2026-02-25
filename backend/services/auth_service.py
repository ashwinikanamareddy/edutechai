"""
services/auth_service.py — Business logic for user registration, login, and lookup.
"""
from uuid import uuid4
from typing import Any, Dict

from fastapi import HTTPException

from core.security import hash_password, verify_password, create_access_token
from models.auth_models import RegisterRequest, LoginRequest
from services.db import supabase


def _normalize_user_row(row: Dict[str, Any], token: str | None = None) -> Dict[str, Any]:
    """Normalize a DB user row into the public-facing user shape."""
    return {
        "id": row.get("id"),
        "token": token,
        "role": row.get("role"),
        "name": row.get("full_name") or "User",
        "grade": row.get("grade"),
        "school": row.get("school_name"),
        "language": row.get("language_preference"),
        "email": row.get("email"),
        "parent_phone": row.get("parent_phone"),
    }


def register_user(payload: RegisterRequest) -> Dict[str, Any]:
    role = (payload.role or "student").lower()
    if role not in {"student", "teacher", "parent"}:
        raise HTTPException(status_code=400, detail="Invalid role")

    full_name = (payload.full_name or payload.name or "").strip()
    if not full_name:
        raise HTTPException(status_code=400, detail="Full name is required")

    email = payload.email.strip().lower() if payload.email else None
    if email:
        try:
            existing = supabase.table("users").select("id").eq("email", email).limit(1).execute()
            if existing.data:
                raise HTTPException(status_code=400, detail="User already exists")
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"User lookup failed: {exc}") from exc

    password_hash = hash_password(payload.password)
    user_row = {
        "id": str(uuid4()),
        "role": role,
        "full_name": full_name,
        "email": email,
        "grade": payload.grade,
        "school_name": payload.school_name or payload.school,
        "parent_phone": payload.parent_phone,
        "language_preference": payload.language_preference or payload.language or "English",
        "password_hash": password_hash,
    }

    try:
        created = supabase.table("users").insert(user_row).execute()
        if not created.data:
            raise HTTPException(status_code=500, detail="User registration failed")
        row = created.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"User registration failed: {exc}") from exc

    token = create_access_token(str(row.get("id")), str(row.get("role")))
    return _normalize_user_row(row, token=token)


def login_user(payload: LoginRequest) -> Dict[str, Any]:
    role = (payload.role or "student").lower()
    try:
        query = supabase.table("users").select("*")
        if role == "parent":
            phone = (payload.phone or payload.parent_phone or "").strip()
            if not phone:
                raise HTTPException(status_code=400, detail="Parent phone is required")
            query = query.eq("role", "parent").eq("parent_phone", phone)
        elif payload.email:
            query = query.eq("email", payload.email.strip().lower())
        else:
            full_name = (payload.name or "").strip()
            if not full_name:
                raise HTTPException(status_code=400, detail="Email or full name is required for login")
            query = query.eq("full_name", full_name).eq("role", role)
            if payload.parent_phone:
                query = query.eq("parent_phone", payload.parent_phone)
        result = query.limit(1).execute()
        row = result.data[0] if result.data else None
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Login lookup failed: {exc}") from exc

    if not row:
        # Distinguish: user does not exist vs. wrong credentials
        raise HTTPException(status_code=404, detail="User not found")

    if not row.get("password_hash"):
        # Parent accounts may have no password (phone-only auth)
        if str(row.get("role")) == "parent":
            token = create_access_token(str(row.get("id")), str(row.get("role")))
            return _normalize_user_row(row, token=token)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not payload.password or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(row.get("id")), str(row.get("role")))
    return _normalize_user_row(row, token=token)


def get_me(user_id: str) -> Dict[str, Any]:
    try:
        result = supabase.table("users").select("*").eq("id", user_id).limit(1).execute()
        row = result.data[0] if result.data else None
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"User lookup failed: {exc}") from exc

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    return _normalize_user_row(row)
