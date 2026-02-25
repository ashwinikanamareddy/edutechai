"""
services/db.py — Single Supabase client instance, reused across all services.
"""
import warnings
from supabase import create_client
from core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import os
_url = os.getenv("SUPABASE_URL") or SUPABASE_URL
_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or SUPABASE_SERVICE_ROLE_KEY

if not _url or not _key:
    warnings.warn(
        "Supabase credentials not found. Backend will start but database calls will fail. "
        "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment or backend/.env",
        UserWarning,
        stacklevel=2,
    )
    _url = _url or "https://placeholder.supabase.co"
    _key = _key or "placeholder-key"

try:
    supabase = create_client(_url, _key)
    print("[db] Supabase client initialized OK")
except Exception as e:
    import traceback
    print(f"[db] Supabase initialization failed: {str(e)}")
    print(traceback.format_exc())
    # Create a dummy client to prevent circular import failures if possible, 
    # but here we just let it be or handle it in service calls.
    supabase = create_client("https://placeholder.supabase.co", "placeholder-key")
