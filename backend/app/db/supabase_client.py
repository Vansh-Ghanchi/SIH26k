import sys
from supabase import create_client, Client
from app.config import settings

_client: Client = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        if not settings.SUPABASE_URL or not key:
            print("[WARN] Supabase URL or Key not set in environment.")
            return None
        try:
            _client = create_client(settings.SUPABASE_URL, key)
            print("[INFO] Supabase Client Initialized successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to initialize Supabase client: {e}", file=sys.stderr)
            return None
    return _client
