from fastapi import APIRouter
from app.data_fallback import load_cached_projects

router = APIRouter(prefix="/analytics", tags=["Analytics & Hotspots"])

@router.get("/portfolio-summary")
def get_portfolio_summary():
    projects = load_cached_projects()
    
    total_projects = len(projects)
    total_original = sum(p["original_cost"] for p in projects)
    total_revised = sum(p["revised_cost"] for p in projects)
    total_expenditure = sum(p["expenditure"] for p in projects)
    critical_count = len([p for p in projects if p["risk_level"] == "Critical"])
    high_count = len([p for p in projects if p["risk_level"] == "High"])

    return {
        "success": True,
        "summary": {
            "total_monitored_projects": total_projects,
            "total_original_cost_cr": round(total_original, 2),
            "total_revised_cost_cr": round(total_revised, 2),
            "total_expenditure_cr": round(total_expenditure, 2),
            "overall_cost_overrun_pct": round(((total_revised - total_original) / total_original) * 100, 2) if total_original > 0 else 0.0,
            "critical_risk_projects": critical_count,
            "high_risk_projects": high_count
        }
    }
