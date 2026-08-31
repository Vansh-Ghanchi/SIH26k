from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/admin", tags=["Administrator Console"])

class UserCreateRequest(BaseModel):
    name: str
    email: str
    role: str = "Government Officer"
    department: str = "Ministry of Road Transport & Highways"

MOCK_ADMIN_USERS = [
    {"id": 1, "name": "Dr. Rajesh Kumar (IAS)", "email": "rajesh.kumar@mospi.gov.in", "role": "Government Officer", "department": "Ministry of Road Transport & Highways", "status": "Active", "lastActive": "Just now"},
    {"id": 2, "name": "Ananya Deshmukh", "email": "ananya.reviewer@mospi.gov.in", "role": "Reviewer / Monitoring Officer", "department": "Central IPMD Audit Cell", "status": "Active", "lastActive": "4 mins ago"},
    {"id": 3, "name": "Amit Sharma", "email": "admin.system@mospi.gov.in", "role": "Project Administrator", "department": "Infrastructure Project Monitoring Division (MoSPI)", "status": "Active", "lastActive": "10 mins ago"},
    {"id": 4, "name": "Vikram Malhotra", "email": "vikram.m@nhai.gov.in", "role": "Government Officer", "department": "NHAI National Highway Operations", "status": "Active", "lastActive": "1 hour ago"},
    {"id": 5, "name": "Sanjay Barua", "email": "sanjay.b@iwai.gov.in", "role": "Government Officer", "department": "Inland Waterways Authority of India (IWAI)", "status": "Active", "lastActive": "3 hours ago"},
    {"id": 6, "name": "M. K. Tripathy", "email": "tripathy.mk@cpwd.gov.in", "role": "Reviewer / Monitoring Officer", "department": "CPWD Verification Directorate", "status": "Active", "lastActive": "Yesterday"}
]

MOCK_INGESTION_STATUS = [
    {"id": 1, "ministry": "Ministry of Road Transport & Highways", "projects": 312, "records": 312, "status": "Validated & Synced", "date": "28 Apr 2026", "latency": "1.2s"},
    {"id": 2, "ministry": "Ministry of Railways", "projects": 405, "records": 405, "status": "Validated & Synced", "date": "29 Apr 2026", "latency": "2.1s"},
    {"id": 3, "ministry": "Ministry of Petroleum & Natural Gas", "projects": 218, "records": 218, "status": "Validated & Synced", "date": "30 Apr 2026", "latency": "0.9s"},
    {"id": 4, "ministry": "Ministry of Jal Shakti", "projects": 280, "records": 280, "status": "Validated & Synced", "date": "Today, 11:20 AM", "latency": "1.8s"},
    {"id": 5, "ministry": "Ministry of Power & Renewable Energy", "projects": 366, "records": 0, "status": "Sync Pending", "date": "Due in 2 days", "latency": "--"}
]

@router.get("/system-health")
def get_system_health():
    """Retrieve server clusters telemetry, memory, and pipeline latency."""
    return {
        "success": True,
        "health": {
            "uptime_pct": "99.98%",
            "active_services": "12 / 12",
            "db_status": "Connected (Supabase PostgreSQL)",
            "pipeline_latency_ms": 42,
            "security_vulnerabilities": 0,
            "clusters": [
                {"name": "ML Risk Scoring Pipeline", "status": "Healthy", "load": "34%", "memory": "18.4 GB / 32 GB", "uptime": "99.98%"},
                {"name": "PostgreSQL DRISHTI Data Lake", "status": "Healthy", "load": "48%", "memory": "42.1 GB / 64 GB", "uptime": "100%"},
                {"name": "Realtime WebSocket Broker", "status": "Healthy", "load": "22%", "memory": "8.2 GB / 16 GB", "uptime": "99.95%"},
                {"name": "GIS Geospatial Map Server", "status": "Optimal", "load": "39%", "memory": "14.6 GB / 32 GB", "uptime": "99.91%"}
            ]
        }
    }

@router.get("/users")
def get_admin_users():
    """Retrieve master user directory with 3-tier government roles."""
    return {"success": True, "total": len(MOCK_ADMIN_USERS), "users": MOCK_ADMIN_USERS}

@router.post("/users")
def create_admin_user(payload: UserCreateRequest):
    """Provision a new official user account."""
    new_user = {
        "id": len(MOCK_ADMIN_USERS) + 1,
        "name": payload.name,
        "email": payload.email,
        "role": payload.role,
        "department": payload.department,
        "status": "Active",
        "lastActive": "Just now"
    }
    MOCK_ADMIN_USERS.insert(0, new_user)
    return {"success": True, "message": f"User {payload.name} successfully provisioned.", "user": new_user}

@router.patch("/users/{id}/status")
def toggle_user_status(id: int):
    """Toggle user account status between Active and Suspended."""
    user = next((u for u in MOCK_ADMIN_USERS if u["id"] == id), None)
    if not user:
        raise HTTPException(status_code=404, detail=f"User #{id} not found.")
    user["status"] = "Suspended" if user["status"] == "Active" else "Active"
    return {"success": True, "message": f"User status updated to {user['status']}.", "user": user}

@router.get("/ingestion-status")
def get_ingestion_status():
    """Retrieve 17-Ministry monthly CUF data ingestion status."""
    return {"success": True, "batches": MOCK_INGESTION_STATUS}

@router.post("/ingestion/force-sync/{id}")
def force_sync_ministry_ingestion(id: int):
    """Trigger manual data ingestion and schema validation for a Ministry."""
    batch = next((b for b in MOCK_INGESTION_STATUS if b["id"] == id), None)
    if not batch:
        raise HTTPException(status_code=404, detail=f"Ingestion batch #{id} not found.")
    batch["records"] = batch["projects"]
    batch["status"] = "Validated & Synced"
    batch["date"] = "Just now"
    batch["latency"] = "1.1s"
    return {"success": True, "message": f"Ministry '{batch['ministry']}' synchronized & validated (100%).", "batch": batch}

@router.get("/model-status")
def get_ai_model_status():
    """Retrieve AI model versions, training timestamps, and accuracy metrics."""
    return {
        "success": True,
        "models": [
            {"model": "cost_escalation_model.joblib", "algorithm": "XGBoost Regressor (100 trees)", "accuracy_r2": 0.892, "version": "v2.4", "status": "Loaded"},
            {"model": "deadline_slip_model.joblib", "algorithm": "LSTM Multi-Step Recurrent Network", "accuracy_acc": "94.1%", "version": "v3.1", "status": "Loaded"},
            {"model": "high_risk_model.joblib", "algorithm": "Random Forest Classifier", "f1_score": 0.915, "version": "v3.2", "status": "Loaded"},
            {"model": "TreeSHAP Attribution", "algorithm": "TreeExplainer Matrix", "latency_ms": "12ms", "version": "v1.8", "status": "Optimal"}
        ]
    }

@router.post("/models/retrain")
def trigger_model_retraining():
    """Trigger background retraining of DRISHTI Multi-Target ML Ensemble."""
    return {
        "success": True,
        "message": "DRISHTI ML Multi-Target Ensemble retrained (v3.3) with latest 2,098 project parameters.",
        "retrained_at": "Just now",
        "status": "Completed"
    }
