import os
from dotenv import load_dotenv

# Load .env file from backend root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://jttpvyqcnzxnlawboics.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0dHB2eXFjbnp4bmxhd2JvaWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDM2ODEsImV4cCI6MjEwMzY3OTY4MX0.8TCOCvpBAuzD8lZbCmCp0P8f6-g00YZ6eG1B-X8qBTI")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0dHB2eXFjbnp4bmxhd2JvaWNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwMzY4MSwiZXhwIjoyMTAzNjc5NjgxfQ.WnTJ1nQcTk238oR_ED9vzjMOHhngxBt7ib5iuHklTko")
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

settings = Settings()
