from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_v1_router

app = FastAPI(
    title="MoSPI PAIMANA - Central Sector Infrastructure AI Monitoring API",
    description="Enterprise Backend for Infrastructure Project Monitoring, ML Risk Early Warnings, and Supabase Integration.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health Check
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "MoSPI PAIMANA Backend & AI Engine",
        "version": "1.0.0",
        "database": "Supabase Cloud Connected" if settings.SUPABASE_URL else "Local Mode"
    }

# Mount v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)
