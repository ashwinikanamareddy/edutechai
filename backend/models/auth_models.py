"""
models/auth_models.py — Pydantic models for auth endpoints.
"""
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    role: str
    full_name: str | None = None
    name: str | None = None
    email: str | None = None
    password: str
    grade: int | None = None
    school_name: str | None = None
    school: str | None = None
    parent_phone: str | None = None
    language_preference: str | None = None
    language: str | None = None


class LoginRequest(BaseModel):
    role: str | None = "student"
    email: str | None = None
    phone: str | None = None
    parent_phone: str | None = None
    student_id: str | None = None
    password: str | None = None
    name: str | None = None
