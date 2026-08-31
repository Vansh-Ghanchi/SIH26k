from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/analytics", tags=["Sector Analytics & Benchmarking"])

@router.get("/ministry-comparison")
def get_ministry_comparison(period: Optional[str] = Query("1y", description="Time period filter: 3m, 6m, 1y")):
    """Retrieve comparative risk and delay metrics across Central Ministries."""
    return {
        "success": True,
        "period": period,
        "ministries": [
            {"ministry": "Ministry of Railways", "avgRisk": 64.2, "delayedCount": 184, "totalProjects": 405, "costOverrunCr": 18420},
            {"ministry": "Ministry of Road Transport & Highways", "avgRisk": 58.4, "delayedCount": 112, "totalProjects": 312, "costOverrunCr": 11240},
            {"ministry": "Ministry of Power", "avgRisk": 52.1, "delayedCount": 98, "totalProjects": 366, "costOverrunCr": 8950},
            {"ministry": "Ministry of Jal Shakti", "avgRisk": 68.9, "delayedCount": 124, "totalProjects": 280, "costOverrunCr": 14200},
            {"ministry": "Ministry of Petroleum & Natural Gas", "avgRisk": 38.5, "delayedCount": 45, "totalProjects": 218, "costOverrunCr": 4120},
            {"ministry": "Ministry of Civil Aviation", "avgRisk": 49.0, "delayedCount": 38, "totalProjects": 142, "costOverrunCr": 3680}
        ]
    }

@router.get("/sector-radar")
def get_sector_radar(period: Optional[str] = Query("1y", description="Time period: 3m, 6m, 1y")):
    """Retrieve 5-axis normalized efficiency radar metrics across infrastructure sectors."""
    return {
        "success": True,
        "period": period,
        "radar_data": [
            {"subject": "Milestone Velocity", "Highways": 72, "Railways": 54, "Aviation": 82, "Power": 68, "Water": 48},
            {"subject": "Budget Compliance", "Highways": 64, "Railways": 48, "Aviation": 76, "Power": 62, "Water": 42},
            {"subject": "Land Handover Speed", "Highways": 58, "Railways": 42, "Aviation": 88, "Power": 74, "Water": 38},
            {"subject": "Clearance Speed", "Highways": 66, "Railways": 51, "Aviation": 84, "Power": 69, "Water": 45},
            {"subject": "Reporting Health", "Highways": 88, "Railways": 92, "Aviation": 95, "Power": 84, "Water": 78}
        ]
    }

@router.get("/cost-overrun-trend")
def get_cost_overrun_trend(period: Optional[str] = Query("1y", description="Time period: 3m, 6m, 1y")):
    """Retrieve multi-month longitudinal cost escalation area trajectory."""
    data_1y = [
        {"month": "Apr 25", "overrunPct": 8.4, "delayedProjects": 142},
        {"month": "May 25", "overrunPct": 9.1, "delayedProjects": 156},
        {"month": "Jun 25", "overrunPct": 10.2, "delayedProjects": 172},
        {"month": "Jul 25", "overrunPct": 11.4, "delayedProjects": 184},
        {"month": "Aug 25", "overrunPct": 12.1, "delayedProjects": 196},
        {"month": "Sep 25", "overrunPct": 12.8, "delayedProjects": 210},
        {"month": "Oct 25", "overrunPct": 13.5, "delayedProjects": 224},
        {"month": "Nov 25", "overrunPct": 14.1, "delayedProjects": 238},
        {"month": "Dec 25", "overrunPct": 14.7, "delayedProjects": 252},
        {"month": "Jan 26", "overrunPct": 15.1, "delayedProjects": 268},
        {"month": "Feb 26", "overrunPct": 15.3, "delayedProjects": 279},
        {"month": "Mar 26", "overrunPct": 15.5, "delayedProjects": 294}
    ]
    
    if period == "3m":
        return {"success": True, "period": "3m", "trend": data_1y[-3:]}
    elif period == "6m":
        return {"success": True, "period": "6m", "trend": data_1y[-6:]}
    return {"success": True, "period": "1y", "trend": data_1y}

@router.get("/key-insights")
def get_key_insights():
    """Retrieve 4 algorithmic policy insights for infrastructure governance."""
    return {
        "success": True,
        "insights": [
            {
                "type": "danger",
                "title": "Water & Irrigation Sector Overrun Alert",
                "desc": "Water resources projects exhibit the highest schedule lag (+22 months avg) driven by state revenue land boundary disputes."
            },
            {
                "type": "warning",
                "title": "Railways Alignment Bottlenecks",
                "desc": "184 Railway projects require inter-ministerial forest clearances across Odisha, Jharkhand, and Chhattisgarh corridors."
            },
            {
                "type": "success",
                "title": "Civil Aviation Greenfield Success",
                "desc": "Airport terminal construction demonstrates lowest cost variance (+5.2%) and highest monthly reporting compliance (95%)."
            },
            {
                "type": "accent",
                "title": "Q4 FY25-26 Budget Disbursement Health",
                "desc": "Overall portfolio financial utilization reached 63.41% with ₹28.14 Lakh Crore cumulative capital deployed."
            }
        ]
    }
