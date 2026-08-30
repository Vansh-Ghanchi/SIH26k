import os
import sys
from typing import Optional
from fastapi import APIRouter, Query
from app.db.supabase_client import get_supabase
from app.data_fallback import get_fallback_projects

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("")
def list_projects(
    search: Optional[str] = None,
    ministry: Optional[str] = None,
    sector: Optional[str] = None,
    state: Optional[str] = None,
    risk: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    supabase = get_supabase()
    
    # Try querying Supabase
    if supabase:
        try:
            query = supabase.table("projects").select("*", count="exact")

            if search:
                query = query.ilike("project_name", f"%{search}%")
            if ministry and ministry != "All":
                query = query.eq("ministry", ministry)
            if sector and sector != "All":
                query = query.eq("sector", sector)
            if state and state != "All":
                query = query.ilike("state_ut", f"%{state}%")
            if status and status != "All":
                query = query.eq("project_status", status)

            start = (page - 1) * page_size
            end = start + page_size - 1
            res = query.range(start, end).execute()

            return {
                "success": True,
                "total": res.count or len(res.data),
                "page": page,
                "page_size": page_size,
                "data": res.data
            }
        except Exception as e:
            print(f"[API Projects Error]: {e}", file=sys.stderr)

    # Fallback to local memory pipeline if table not yet migrated
    data = get_fallback_projects(search=search, ministry=ministry, sector=sector, state=state, risk=risk, page=page, page_size=page_size)
    return data

@router.get("/{project_id}")
def get_project_details(project_id: str):
    supabase = get_supabase()
    if supabase:
        try:
            res = supabase.table("projects").select("*").eq("project_id", project_id).execute()
            if res.data:
                return {"success": True, "data": res.data[0]}
        except Exception as e:
            print(f"[API Project Details Error]: {e}", file=sys.stderr)
    return {"success": False, "message": "Project not found"}
