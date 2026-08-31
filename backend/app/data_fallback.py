import os
import pandas as pd

_cached_projects = None

def load_cached_projects():
    global _cached_projects
    if _cached_projects is not None:
        return _cached_projects

    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "SIH_PAIMANA_July2025_March2026_24_COLUMNS_FINAL.csv"))
    if not os.path.exists(csv_path):
        _cached_projects = []
        return _cached_projects

    df = pd.read_csv(csv_path, low_memory=False)
    # Deduplicate latest by project_id
    df_sorted = df.sort_values(by="reporting_month", ascending=False)
    unique_df = df_sorted.drop_duplicates(subset=["project_id"]).copy()

    records = []
    for _, r in unique_df.iterrows():
        p_id = str(r.get("project_id", ""))
        if not p_id or p_id == "nan":
            continue

        cost_rev = float(r.get("cost_revision_pct", 0.0) or 0.0)
        dead_flag = bool(str(r.get("deadline_revision_flag", "")).lower() == "true")
        
        # Determine risk level
        if cost_rev > 25.0 or (dead_flag and cost_rev > 10.0):
            risk_level = "Critical"
        elif cost_rev > 10.0 or dead_flag:
            risk_level = "High"
        elif cost_rev > 0.0:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        records.append({
            "id": p_id,
            "project_id": p_id,
            "name": str(r.get("project_name", "")),
            "ministry": str(r.get("ministry", "Others")),
            "sector": str(r.get("sector", "Infrastructure")),
            "state": str(r.get("state_ut", "National")),
            "implementing_agency": str(r.get("implementing_agency", "")),
            "original_cost": float(r.get("original_cost_cr", 0.0) or 0.0),
            "revised_cost": float(r.get("revised_cost_cr", 0.0) or 0.0),
            "expenditure": float(r.get("cumulative_expenditure_cr", 0.0) or 0.0),
            "physical_progress": float(r.get("physical_progress_pct", 0.0) or 0.0),
            "cost_revision_pct": cost_rev,
            "deadline_revision_flag": dead_flag,
            "risk_level": risk_level,
            "status": str(r.get("project_status", "Ongoing"))
        })

    _cached_projects = records
    return _cached_projects

def get_fallback_projects(search=None, ministry=None, sector=None, state=None, risk=None, page=1, page_size=20):
    all_projects = load_cached_projects()
    
    filtered = all_projects
    if search:
        s = search.lower()
        filtered = [p for p in filtered if s in p["name"].lower() or s in p["project_id"].lower()]
    if ministry and ministry != "All":
        filtered = [p for p in filtered if p["ministry"] == ministry]
    if sector and sector != "All":
        filtered = [p for p in filtered if p["sector"] == sector]
    if state and state != "All":
        filtered = [p for p in filtered if state.lower() in p["state"].lower()]
    if risk and risk != "All":
        filtered = [p for p in filtered if p["risk_level"].lower() == risk.lower()]

    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]

    return {
        "success": True,
        "total": len(filtered),
        "page": page,
        "page_size": page_size,
        "data": paginated
    }
