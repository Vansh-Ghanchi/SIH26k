from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/early-warnings", tags=["Early Warning System"])

class BulkReviewRequest(BaseModel):
    priority: Optional[str] = "All"
    alert_ids: Optional[List[int]] = None

MOCK_ALERTS = [
    {
        "id": 1,
        "projectId": "706724",
        "projectName": "Guwahati Airport New Integrated Terminal Building Construction Project",
        "ministry": "Ministry of Civil Aviation",
        "sector": "Aviation",
        "state": "Assam",
        "prevScore": 79,
        "currentScore": 94,
        "change": 15,
        "priority": "Critical",
        "reason": "Cost overrun of +47.2% detected (Revised: ₹2,520 Cr). Physical progress lagging at 97%.",
        "timestamp": "7 mins ago",
        "reviewed": False
    },
    {
        "id": 2,
        "projectId": "400010",
        "projectName": "Construction of Terminal Building & Associated works at Leh Airport, Ladakh",
        "ministry": "Ministry of Civil Aviation",
        "sector": "Aviation",
        "state": "Ladakh",
        "prevScore": 73,
        "currentScore": 88,
        "change": 15,
        "priority": "Critical",
        "reason": "Cost overrun of +33.33% detected (Revised: ₹640 Cr). Physical progress lagging at 79%.",
        "timestamp": "14 mins ago",
        "reviewed": False
    },
    {
        "id": 3,
        "projectId": "612063",
        "projectName": "Construction of New Terminal Building, Second Link Taxi Track, Apron Expansion",
        "ministry": "Ministry of Civil Aviation",
        "sector": "Aviation",
        "state": "Uttar Pradesh",
        "prevScore": 70,
        "currentScore": 85,
        "change": 15,
        "priority": "Critical",
        "reason": "Cost overrun of +25.18% detected (Revised: ₹274 Cr). Physical progress lagging at 100%.",
        "timestamp": "21 mins ago",
        "reviewed": False
    },
    {
        "id": 4,
        "projectId": "400259",
        "projectName": "Ghatampur Thermal Power Plant 3 X 660 MW",
        "ministry": "Ministry of Power",
        "sector": "Power",
        "state": "Uttar Pradesh",
        "prevScore": 71,
        "currentScore": 86,
        "change": 15,
        "priority": "Critical",
        "reason": "Cost overrun of +26.36% detected (Revised: ₹21,781 Cr). Physical progress lagging at 95%.",
        "timestamp": "28 mins ago",
        "reviewed": False
    },
    {
        "id": 5,
        "projectId": "400203",
        "projectName": "Railways Dharamjaigarh-Korba",
        "ministry": "Ministry of Railways",
        "sector": "Railways",
        "state": "Chhattisgarh",
        "prevScore": 78,
        "currentScore": 93,
        "change": 15,
        "priority": "Critical",
        "reason": "Cost overrun of +44.62% detected (Revised: ₹2,439 Cr). Physical progress lagging at 43%.",
        "timestamp": "35 mins ago",
        "reviewed": False
    }
]

@router.get("")
@router.get("/")
def get_early_warnings(
    priority: Optional[str] = Query("All", description="Filter by priority: All, Critical, High, Medium, Low"),
    limit: Optional[int] = Query(None, description="Limit count of alerts")
):
    """Retrieve list of algorithmic escalation signals and early warnings."""
    res = MOCK_ALERTS if priority == "All" else [a for a in MOCK_ALERTS if a["priority"] == priority]
    if limit:
        res = res[:limit]
    return {"success": True, "total": len(res), "alerts": res}

@router.patch("/{id}/reviewed")
def mark_alert_reviewed(id: int):
    """Mark a single early warning signal as reviewed & verified."""
    alert = next((a for a in MOCK_ALERTS if a["id"] == id), None)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert #{id} not found.")
    alert["reviewed"] = True
    return {"success": True, "message": f"Alert #{id} marked as Reviewed.", "alert": alert}

@router.patch("/bulk-reviewed")
def bulk_mark_reviewed(payload: Optional[BulkReviewRequest] = None):
    """Bulk mark all visible alerts as reviewed."""
    p_filter = payload.priority if payload else "All"
    count = 0
    for a in MOCK_ALERTS:
        if p_filter == "All" or a["priority"] == p_filter:
            a["reviewed"] = True
            count += 1
    return {"success": True, "message": f"Successfully marked {count} alerts as Reviewed.", "updated_count": count}
