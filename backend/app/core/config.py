import os
from dotenv import load_dotenv

# Load .env file from backend root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

class Settings:
    PROJECT_NAME: str = "DRISHTI AI 2.0"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "Data-driven Risk Intelligence System for Infrastructure Tracking & Insights - Central Ministry of Statistics and Programme Implementation (MoSPI)"
    
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "drishti-mospi-enterprise-secret-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Hours
    
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://jttpvyqcnzxnlawboics.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0dHB2eXFjbnp4bmxhd2JvaWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDM2ODEsImV4cCI6MjEwMzY3OTY4MX0.8TCOCvpBAuzD8lZbCmCp0P8f6-g00YZ6eG1B-X8qBTI")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0dHB2eXFjbnp4bmxhd2JvaWNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwMzY4MSwiZXhwIjoyMTAzNjc5NjgxfQ.WnTJ1nQcTk238oR_ED9vzjMOHhngxBt7ib5iuHklTko")

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

settings = Settings()
