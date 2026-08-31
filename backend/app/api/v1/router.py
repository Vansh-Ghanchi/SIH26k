from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as projects_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.early_warnings import router as warnings_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.reviewer import router as reviewer_router
from app.api.v1.admin import router as admin_router
from app.api.v1.reports import router as reports_router
from app.api.v1.ai_assistant import router as assistant_router

api_v1_router = APIRouter()

# Include all 8 Specialized Domain Routers
api_v1_router.include_router(auth_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(predictions_router)
api_v1_router.include_router(warnings_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(reviewer_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(assistant_router)
