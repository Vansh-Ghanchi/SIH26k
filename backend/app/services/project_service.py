import os
import csv
import math
from typing import List, Dict, Any, Optional

class ProjectService:
    def __init__(self):
        self.projects: List[Dict[str, Any]] = []
        self._load_projects()

    def _load_projects(self):
        """Load projects from official MoSPI CSV or enriched fallback."""
        csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "SIH_PAIMANA_July2025_March2026_24_COLUMNS_FINAL.csv"))
        
        if os.path.exists(csv_path):
            try:
                projects_map = {}
                with open(csv_path, mode='r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        pid = str(row.get("project_id", "")).strip()
                        if not pid:
                            continue
                        
                        orig_cost = float(row.get("original_cost_cr") or 0.0)
                        rev_cost = float(row.get("revised_cost_cr") or orig_cost)
                        exp = float(row.get("cumulative_expenditure_cr") or 0.0)
                        phys_prog = float(row.get("physical_progress_pct") or 0.0)
                        fin_prog = round((exp / (rev_cost or 1.0)) * 100, 1)
                        
                        risk_score = float(row.get("risk_score") or (88.0 if phys_prog < 40 and exp > orig_cost else 45.0))
                        risk_level = "Critical" if risk_score >= 75 else "High" if risk_score >= 50 else "Moderate" if risk_score >= 25 else "Low"

                        projects_map[pid] = {
                            "id": pid,
                            "projectId": pid,
                            "name": row.get("project_name", "Central Infrastructure Project"),
                            "ministry": row.get("ministry_name", "Ministry of Road Transport & Highways"),
                            "sector": row.get("sector_name", "Highways"),
                            "state": row.get("state_name", "National"),
                            "agency": row.get("implementing_agency", "Nodal Authority"),
                            "originalCostCr": orig_cost,
                            "revisedCostCr": rev_cost,
                            "costValue": rev_cost,
                            "expenditureCr": exp,
                            "physicalProgress": phys_prog,
                            "progress": phys_prog,
                            "financialProgress": fin_prog,
                            "riskLevel": risk_level,
                            "riskScore": round(risk_score, 1),
                            "overallRisk": round(risk_score, 1),
                            "costRevisionPct": float(row.get("cost_revision_flag") or (round(((rev_cost - orig_cost) / (orig_cost or 1)) * 100, 1) if rev_cost > orig_cost else 0)),
                            "deadlineRevisionFlag": bool(row.get("deadline_revision_flag") == "1" or row.get("deadline_revision_flag") == "True"),
                            "status": "In Progress" if phys_prog < 100 else "Completed",
                            "reportingMonth": row.get("reporting_month", "March 2026"),
                            "approvalDate": row.get("approval_date", "2021-04-15"),
                            "targetCompletion": row.get("revised_completion_date") or row.get("original_completion_date") or "2027-12-31"
                        }
                
                self.projects = list(projects_map.values())
                print(f"[ProjectService] Successfully loaded {len(self.projects)} authentic MoSPI projects.")
                return
            except Exception as e:
                print(f"[ProjectService] CSV parsing notice: {e}, using internal repository.")
        
        # Fallback if CSV is not read
        self._load_fallback_projects()

    def _load_fallback_projects(self):
        # High quality sample fallback
        self.projects = [
            {
                "id": "615186",
                "projectId": "615186",
                "name": "Sasti Expansion Opencast Coal Mine Project",
                "ministry": "Ministry of Coal",
                "sector": "Coal",
                "state": "Maharashtra",
                "agency": "Western Coalfields Limited (WCL)",
                "originalCostCr": 672.0,
                "revisedCostCr": 845.0,
                "expenditureCr": 512.0,
                "physicalProgress": 58.0,
                "financialProgress": 60.5,
                "riskLevel": "Medium",
                "riskScore": 48.0,
                "status": "In Progress"
            }
        ]

    def get_filtered_projects(self, search: Optional[str] = None, ministry: Optional[str] = None,
                              sector: Optional[str] = None, state: Optional[str] = None,
                              risk: Optional[str] = None, page: int = 1, page_size: int = 8) -> Dict[str, Any]:
        results = self.projects
        
        if search:
            q = search.lower()
            results = [p for p in results if q in p["name"].lower() or q in p["id"].lower() or q in p.get("agency", "").lower()]
        if ministry and ministry != "All":
            results = [p for p in results if p["ministry"] == ministry]
        if sector and sector != "All":
            results = [p for p in results if p["sector"] == sector]
        if state and state != "All":
            results = [p for p in results if p["state"] == state]
        if risk and risk != "All":
            results = [p for p in results if p["riskLevel"] == risk]
            
        total_count = len(results)
        total_pages = math.ceil(total_count / page_size) if page_size > 0 else 1
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        return {
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "data": results[start_idx:end_idx]
        }

    def get_project_by_id(self, project_id: str) -> Optional[Dict[str, Any]]:
        return next((p for p in self.projects if str(p["id"]) == str(project_id)), None)

    def get_stats(self) -> Dict[str, Any]:
        total_projects = len(self.projects)
        total_orig_cost = sum(p.get("originalCostCr", 0) for p in self.projects)
        total_rev_cost = sum(p.get("revisedCostCr", 0) for p in self.projects)
        total_exp = sum(p.get("expenditureCr", 0) for p in self.projects)
        
        high_risk_count = sum(1 for p in self.projects if p.get("riskLevel") in ["Critical", "High"])
        delayed_count = sum(1 for p in self.projects if p.get("deadlineRevisionFlag", False) or p.get("riskLevel") == "Critical")
        overrun_count = sum(1 for p in self.projects if p.get("revisedCostCr", 0) > p.get("originalCostCr", 0))
        
        return {
            "total_projects": total_projects,
            "total_original_cost_lakh_cr": round(total_orig_cost / 100000, 2),
            "total_revised_cost_lakh_cr": round(total_rev_cost / 100000, 2),
            "total_expenditure_lakh_cr": round(total_exp / 100000, 2),
            "high_risk_count": high_risk_count,
            "delayed_count": delayed_count,
            "delayed_pct": round((delayed_count / (total_projects or 1)) * 100, 1),
            "cost_overrun_count": overrun_count,
            "cost_overrun_pct": round((overrun_count / (total_projects or 1)) * 100, 1),
            "status_breakdown": {
                "on_track": total_projects - delayed_count,
                "delayed": delayed_count,
                "critical": sum(1 for p in self.projects if p.get("riskLevel") == "Critical"),
                "completed": sum(1 for p in self.projects if p.get("physicalProgress", 0) >= 100)
            }
        }

    def get_geo_stats(self) -> List[Dict[str, Any]]:
        state_map = {}
        for p in self.projects:
            st = p.get("state", "Other")
            if st not in state_map:
                state_map[st] = {"state": st, "total_projects": 0, "high_risk": 0, "total_cost_cr": 0}
            state_map[st]["total_projects"] += 1
            if p.get("riskLevel") in ["Critical", "High"]:
                state_map[st]["high_risk"] += 1
            state_map[st]["total_cost_cr"] += p.get("revisedCostCr", 0)
            
        return list(state_map.values())

project_service = ProjectService()
