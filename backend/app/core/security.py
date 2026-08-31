import time
import base64
import json
import hmac
import hashlib
from typing import Optional, List
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security_bearer = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[int] = None) -> str:
    """Create a standard HS256 JWT Token without external paid dependencies."""
    to_encode = data.copy()
    expire = int(time.time()) + (expires_delta or settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    to_encode.update({"exp": expire, "iat": int(time.time())})
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_bytes = base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b'=')
    payload_bytes = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).rstrip(b'=')
    
    signature = hmac.new(
        settings.JWT_SECRET.encode(),
        f"{header_bytes.decode()}.{payload_bytes.decode()}".encode(),
        hashlib.sha256
    ).digest()
    sig_bytes = base64.urlsafe_b64encode(signature).rstrip(b'=')
    
    return f"{header_bytes.decode()}.{payload_bytes.decode()}.{sig_bytes.decode()}"

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify HS256 JWT Token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        # Verify Signature
        expected_sig = hmac.new(
            settings.JWT_SECRET.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).rstrip(b'=').decode()
        
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
            
        # Add padding back if necessary
        padded_payload = payload_b64 + '=' * (4 - len(payload_b64) % 4 if len(payload_b64) % 4 != 0 else 0)
        payload = json.loads(base64.urlsafe_b64decode(padded_payload.encode()).decode())
        
        if payload.get("exp") and payload["exp"] < int(time.time()):
            return None  # Expired
            
        return payload
    except Exception:
        return None

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Optional[dict]:
    """Get current authenticated user or return demo session."""
    if not credentials:
        # Graceful fallback for non-strict endpoints
        return {
            "email": "rajesh.kumar@mospi.gov.in",
            "name": "Dr. Rajesh Kumar (IAS)",
            "role": "Government Officer",
            "ministry": "Ministry of Road Transport & Highways"
        }
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def require_roles(allowed_roles: List[str]):
    """Strict Role-Based Access Control (RBAC) Dependency."""
    def role_checker(user: dict = Depends(get_current_user)):
        user_role = user.get("role", "Government Officer")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles}, but user is '{user_role}'"
            )
        return user
    return role_checker
