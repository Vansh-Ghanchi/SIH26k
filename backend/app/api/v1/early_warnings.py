from fastapi import APIRouter
from app.data_fallback import load_cached_projects

router = APIRouter(prefix="/early-warnings", tags=["Early Warnings"])

@router.get("")
def get_early_warnings():
    projects = load_cached_projects()
    
    # Filter critical and high risk warnings
    critical_alerts = []
    for p in projects:
        if p["risk_level"] in ["Critical", "High"] and p["cost_revision_pct"] > 15.0:
            critical_alerts.append({
                "id": f"WRN-{p['project_id']}",
                "project_id": p["project_id"],
                "project_name": p["name"],
                "ministry": p["ministry"],
                "sector": p["sector"],
                "state": p["state"],
                "risk_level": p["risk_level"],
                "cost_overrun_pct": p["cost_revision_pct"],
                "message": f"Critical budget escalation of +{p['cost_revision_pct']}% detected. Physical progress lagging at {p['physical_progress']}%.",
                "recommended_action": "Inter-Ministerial Task Force review recommended."
            })

    return {
        "success": True,
        "total_active_warnings": len(critical_alerts),
        "critical_count": len([w for w in critical_alerts if w["risk_level"] == "Critical"]),
        "high_count": len([w for w in critical_alerts if w["risk_level"] == "High"]),
        "warnings": critical_alerts[:50] # Top 50 prioritized
    }
