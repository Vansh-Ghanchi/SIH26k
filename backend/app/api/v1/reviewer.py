from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/reviewer", tags=["Reviewer & Monitoring Authority"])

class ReviewRemarksRequest(BaseModel):
    remarks: Optional[str] = "Approved and verified against statutory criteria."

MOCK_REGISTRATIONS = [
    {
        "id": "REG-2026-089",
        "name": "Vadodara-Mumbai Expressway Phase 3 (South Corridor)",
        "ministry": "Ministry of Road Transport & Highways",
        "sector": "Road Transport & Highways",
        "agency": "National Highways Authority of India (NHAI)",
        "state": "Gujarat / Maharashtra",
        "approvedCost": 4850.0,
        "startDate": "May 2026",
        "targetCompletion": "Dec 2029",
        "landAcquired": 64.0,
        "submittedBy": "Dr. Rajesh Kumar (Project Officer)",
        "submissionDate": "Today, 09:15 AM",
        "dprDoc": "DPR-NHAI-VM3-Final.pdf",
        "status": "pending",
        "description": "Construction of 8-lane access-controlled greenfield expressway connecting South Gujarat to MMR border."
    },
    {
        "id": "REG-2026-090",
        "name": "Brahmaputra River Multi-Modal Logistics Hub",
        "ministry": "Ministry of Ports, Shipping and Waterways",
        "sector": "Ports & Shipping",
        "agency": "Inland Waterways Authority of India (IWAI)",
        "state": "Assam",
        "approvedCost": 1420.0,
        "startDate": "June 2026",
        "targetCompletion": "Nov 2028",
        "landAcquired": 78.0,
        "submittedBy": "Sanjay Barua (IWAI Lead)",
        "submissionDate": "Yesterday, 03:40 PM",
        "dprDoc": "IWAI-Brahmaputra-Hub-v2.pdf",
        "status": "pending",
        "description": "Integrated riverine terminal with rail sidings, container freight station, and highway connectivity at Pandu port."
    }
]

MOCK_CUF_UPDATES = [
    {
        "id": "SUB-101",
        "projectId": "NH-48-EXP",
        "projectName": "NH-48 Highway Expansion (Gujarat)",
        "agency": "NHAI North Corridor",
        "ministry": "Ministry of Road Transport & Highways",
        "submissionDate": "Today, 10:30 AM",
        "submittedBy": "Dr. Rajesh Kumar",
        "prevSnapshot": {"progress": 40.0, "exp": 1420.0, "revisedCost": 2400.0, "land": 68.0},
        "currSubmission": {"progress": 45.0, "exp": 1650.0, "revisedCost": 2640.0, "land": 72.0},
        "delayReason": "Utility shifting delay in section 4 + cost revision due to steel price index.",
        "discrepancyFlag": "Cost revised upwards (+₹240 Cr) · Land clearance hold noted in Section 4.",
        "status": "pending"
    },
    {
        "id": "SUB-102",
        "projectId": "EDFC-PKG3",
        "projectName": "Eastern Dedicated Freight Corridor (Package 3)",
        "agency": "Dedicated Freight Corridor Corp (DFCCIL)",
        "ministry": "Ministry of Railways",
        "submissionDate": "Yesterday, 04:15 PM",
        "submittedBy": "Arun Verma",
        "prevSnapshot": {"progress": 58.0, "exp": 3200.0, "revisedCost": 4800.0, "land": 88.0},
        "currSubmission": {"progress": 62.0, "exp": 3450.0, "revisedCost": 4800.0, "land": 91.0},
        "delayReason": "On track for revised commissioning milestone Q3 FY26-27.",
        "discrepancyFlag": None,
        "status": "pending"
    }
]

@router.get("/stats")
def get_reviewer_stats():
    """Retrieve Reviewer Centre KPI summary."""
    pending_regs = sum(1 for r in MOCK_REGISTRATIONS if r["status"] == "pending")
    pending_cuf = sum(1 for c in MOCK_CUF_UPDATES if c["status"] == "pending")
    return {
        "success": True,
        "stats": {
            "pending_registrations": pending_regs,
            "pending_cuf_updates": pending_cuf,
            "approved_this_month": 34,
            "high_risk_escalations": 5
        }
    }

@router.get("/registrations")
def get_pending_registrations():
    """Retrieve queue of pending new project proposals."""
    return {"success": True, "registrations": MOCK_REGISTRATIONS}

@router.get("/registrations/{id}")
def get_registration_by_id(id: str):
    """Retrieve detailed project registration proposal."""
    reg = next((r for r in MOCK_REGISTRATIONS if r["id"] == id), None)
    if not reg:
        raise HTTPException(status_code=404, detail=f"Registration '{id}' not found.")
    return {"success": True, "data": reg}

@router.patch("/registrations/{id}/approve")
def approve_registration(id: str, payload: Optional[ReviewRemarksRequest] = None):
    """Approve new project proposal and onboard into Central DRISHTI Repository."""
    reg = next((r for r in MOCK_REGISTRATIONS if r["id"] == id), None)
    if not reg:
        raise HTTPException(status_code=404, detail=f"Registration '{id}' not found.")
    reg["status"] = "approved"
    return {"success": True, "message": f"Proposal '{id}' approved.", "assigned_drishti_id": "PRJ-9182"}

@router.patch("/registrations/{id}/reject")
def reject_registration(id: str, payload: Optional[ReviewRemarksRequest] = None):
    """Return proposal to Implementing Agency for clarification."""
    reg = next((r for r in MOCK_REGISTRATIONS if r["id"] == id), None)
    if not reg:
        raise HTTPException(status_code=404, detail=f"Registration '{id}' not found.")
    reg["status"] = "rejected"
    return {"success": True, "message": f"Proposal '{id}' returned for clarification."}

@router.get("/cuf-updates")
def get_pending_cuf_updates():
    """Retrieve queue of pending monthly CUF progress submissions."""
    return {"success": True, "cuf_updates": MOCK_CUF_UPDATES}

@router.get("/cuf-updates/{id}")
def get_cuf_update_by_id(id: str):
    """Retrieve single monthly CUF verification submission."""
    update = next((u for u in MOCK_CUF_UPDATES if u["id"] == id), None)
    if not update:
        raise HTTPException(status_code=404, detail=f"CUF submission '{id}' not found.")
    return {"success": True, "data": update}

@router.patch("/cuf-updates/{id}/verify")
def verify_cuf_update(id: str, payload: Optional[ReviewRemarksRequest] = None):
    """Verify and ingest monthly progress snapshot into DRISHTI Data Lake."""
    update = next((u for u in MOCK_CUF_UPDATES if u["id"] == id), None)
    if not update:
        raise HTTPException(status_code=404, detail=f"CUF update '{id}' not found.")
    update["status"] = "verified"
    return {"success": True, "message": f"CUF update '{id}' verified & ingested."}

@router.patch("/cuf-updates/{id}/flag")
def flag_cuf_update(id: str, payload: Optional[ReviewRemarksRequest] = None):
    """Flag algorithmic discrepancy in CUF submission."""
    update = next((u for u in MOCK_CUF_UPDATES if u["id"] == id), None)
    if not update:
        raise HTTPException(status_code=404, detail=f"CUF update '{id}' not found.")
    update["status"] = "flagged"
    return {"success": True, "message": f"CUF update '{id}' flagged for discrepancy."}

@router.post("/cuf-updates/{id}/query")
def query_agency_for_cuf(id: str, payload: Optional[ReviewRemarksRequest] = None):
    """Transmit official query memo to Agency Officer."""
    return {"success": True, "message": f"Official query memo transmitted for update '{id}'."}
