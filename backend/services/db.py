"""
services/db.py — Single Supabase client instance, reused across all services.
"""
import warnings
from supabase import create_client
from core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

_url = SUPABASE_URL
_key = SUPABASE_SERVICE_ROLE_KEY

if not _url or not _key:
    warnings.warn(
        "Supabase credentials not found. Backend will start but database calls will fail. "
        "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env",
        UserWarning,
        stacklevel=2,
    )
    _url = _url or "https://placeholder.supabase.co"
    _key = _key or "placeholder-key"

supabase = create_client(_url, _key)
