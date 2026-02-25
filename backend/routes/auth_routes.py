"""
routes/auth_routes.py — Auth endpoints: register, login, me.
"""
from fastapi import APIRouter, Header

from core.security import decode_token
from models.auth_models import RegisterRequest, LoginRequest
from services.auth_service import register_user, login_user, get_me
from utils.response import ok

router = APIRouter(tags=["auth"])


@router.post("/register")
def register(payload: RegisterRequest):
    user = register_user(payload)
    return ok(user)


@router.post("/login")
def login(payload: LoginRequest):
    user = login_user(payload)
    return ok(user)


@router.get("/me")
def auth_me(authorization: str | None = Header(default=None)):
    from fastapi import HTTPException
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")
    token = authorization.split(" ", 1)[1].strip()
    claims = decode_token(token)
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = get_me(user_id)
    return ok(user)
