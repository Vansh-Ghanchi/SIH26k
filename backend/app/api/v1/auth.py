from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from app.core.security import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str
    token: str

MOCK_AUTH_USERS = [
    {
        "id": 1,
        "name": "Dr. Rajesh Kumar (IAS)",
        "email": "officer@infrawatch.gov.in",
        "password": "Officer@123",
        "role": "Government Officer",
        "department": "Ministry of Road Transport & Highways (NHAI)"
    },
    {
        "id": 2,
        "name": "Ananya Deshmukh",
        "email": "reviewer@infrawatch.gov.in",
        "password": "Reviewer@123",
        "role": "Reviewer / Monitoring Officer",
        "department": "MoSPI Nodal Verification & Monitoring Division"
    },
    {
        "id": 3,
        "name": "Amit Sharma",
        "email": "admin@infrawatch.gov.in",
        "password": "Admin@123",
        "role": "Project Administrator",
        "department": "DRISHTI Data Informatics & Innovation Division"
    },
    {
        "id": 4,
        "name": "Dr. Rajesh Kumar (IAS)",
        "email": "rajesh.kumar@mospi.gov.in",
        "password": "Officer@2026",
        "role": "Government Officer",
        "department": "Ministry of Road Transport & Highways"
    },
    {
        "id": 5,
        "name": "Ananya Deshmukh",
        "email": "ananya.reviewer@mospi.gov.in",
        "password": "Reviewer@2026",
        "role": "Reviewer / Monitoring Officer",
        "department": "Central IPMD Audit Cell"
    },
    {
        "id": 6,
        "name": "Amit Sharma",
        "email": "admin.system@mospi.gov.in",
        "password": "Admin@2026",
        "role": "Project Administrator",
        "department": "Infrastructure Project Monitoring Division (MoSPI)"
    }
]

@router.post("/login")
def login(payload: LoginRequest):
    """Authenticate user with email and password, returning 3-Tier JWT token."""
    user = next((u for u in MOCK_AUTH_USERS if u["email"].lower() == payload.email.lower() and u["password"] == payload.password), None)
    
    # Support demo aliases and flexible passwords (@123 / @2026)
    if not user:
        p_lower = payload.password.lower()
        if (payload.email.startswith("officer") or "rajesh" in payload.email) and ("123" in p_lower or "2026" in p_lower):
            user = MOCK_AUTH_USERS[0]
        elif (payload.email.startswith("reviewer") or "ananya" in payload.email) and ("123" in p_lower or "2026" in p_lower):
            user = MOCK_AUTH_USERS[1]
        elif (payload.email.startswith("admin") or "amit" in payload.email) and ("123" in p_lower or "2026" in p_lower):
            user = MOCK_AUTH_USERS[2]

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid official credentials. Use officer@infrawatch.gov.in (Officer@123), reviewer@infrawatch.gov.in (Reviewer@123), or admin@infrawatch.gov.in (Admin@123)."
        )

    token = create_access_token({
        "sub": user["email"],
        "name": user["name"],
        "role": user["role"],
        "department": user["department"]
    })

    return {
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "department": user["department"],
            "token": token
        }
    }

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    """Invalidate current user session."""
    return {"success": True, "message": "Successfully logged out from DRISHTI Central Portal."}

@router.get("/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Retrieve profile of authenticated user."""
    return {"success": True, "user": current_user}
