from fastapi import APIRouter
from app.api.v1.projects import router as projects_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.early_warnings import router as warnings_router
from app.api.v1.analytics import router as analytics_router

api_v1_router = APIRouter()

api_v1_router.include_router(projects_router)
api_v1_router.include_router(predictions_router)
api_v1_router.include_router(warnings_router)
api_v1_router.include_router(analytics_router)
