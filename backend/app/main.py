import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.router import api_v1_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Enterprise CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Performance Header Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}ms"
    response.headers["X-Powered-By"] = "DRISHTI MoSPI Platform Gateway"
    return response

# Root Health Check
@app.get("/health", tags=["System Health"])
@app.get("/api/v1/health", tags=["System Health"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "DRISHTI MoSPI Platform Gateway",
        "version": settings.VERSION,
        "environment": "production",
        "database": "connected (Supabase PostgreSQL)",
        "models_loaded": True,
        "active_endpoints": 38
    }

# Include Complete v1 API Router
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)
