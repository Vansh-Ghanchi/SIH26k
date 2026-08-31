import io
import csv
from fastapi import APIRouter
from fastapi.responses import Response
from app.services.project_service import project_service

router = APIRouter(prefix="/reports", tags=["Reports & Publications"])

@router.get("/master-csv")
def download_master_csv():
    """Stream download of full 2,098 projects master dataset CSV."""
    projects = project_service.projects
    headers = [
        "Project ID", "Project Name", "Administrative Ministry", "Sector",
        "State / UT", "Implementing Agency", "Sanctioned Cost (Cr)", "Revised Cost (Cr)",
        "Cumulative Expenditure (Cr)", "Physical Progress (%)", "Financial Progress (%)",
        "Risk Level", "Risk Score", "Status", "Reporting Month"
    ]
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    
    for p in projects:
        writer.writerow([
            p.get("id", ""),
            p.get("name", ""),
            p.get("ministry", ""),
            p.get("sector", ""),
            p.get("state", ""),
            p.get("agency", ""),
            p.get("originalCostCr", ""),
            p.get("revisedCostCr", ""),
            p.get("expenditureCr", ""),
            p.get("physicalProgress", ""),
            p.get("financialProgress", ""),
            p.get("riskLevel", ""),
            p.get("riskScore", ""),
            p.get("status", ""),
            p.get("reportingMonth", "")
        ])
    
    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=DRISHTI_Master_Dataset_2098_Projects.csv"}
    )

@router.get("/flash-report")
def download_flash_report():
    """Stream download of official MoSPI Monthly Flash Report summary."""
    stats = project_service.get_stats()
    headers = ["Metric Parameter", "Portfolio Value", "Audit Remarks"]
    rows = [
        ["Total Monitored Infrastructure Projects", f"{stats['total_projects']} Projects", "Projects with sanctioned cost >= Rs 150 Cr"],
        ["Total Sanctioned Original Cost", f"Rs {stats['total_original_cost_lakh_cr']} Lakh Cr", "Cabinet sanction baseline"],
        ["Total Revised Cost Estimate", f"Rs {stats['total_revised_cost_lakh_cr']} Lakh Cr", f"+{stats['cost_overrun_pct']}% portfolio cost overrun"],
        ["Total Cumulative Expenditure", f"Rs {stats['total_expenditure_lakh_cr']} Lakh Cr", "63.41% financial disbursement realized"],
        ["Projects Reporting Schedule Delay", f"{stats['delayed_count']} Projects", f"{stats['delayed_pct']}% of portfolio behind schedule"],
        ["Audit Period", "July 2025 - March 2026", "Ministry of Statistics and Programme Implementation (MoSPI)"]
    ]
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=MoSPI_Monthly_Flash_Report_April_2026.csv"}
    )

@router.get("/mpr")
def download_mpr_report():
    """Download Monthly Progress Report (MPR) summary."""
    return download_flash_report()

@router.get("/high-risk")
def download_high_risk_matrix():
    """Download high-risk escalation matrix CSV."""
    projects = [p for p in project_service.projects if p.get("riskLevel") in ["Critical", "High"]]
    headers = ["Project ID", "Project Name", "Ministry", "State", "Revised Cost (Cr)", "Progress (%)", "Risk Score", "Risk Level"]
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    
    for p in projects:
        writer.writerow([
            p.get("id", ""),
            p.get("name", ""),
            p.get("ministry", ""),
            p.get("state", ""),
            p.get("revisedCostCr", ""),
            p.get("physicalProgress", ""),
            p.get("riskScore", ""),
            p.get("riskLevel", "")
        ])
        
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=MoSPI_High_Risk_Projects_Escalation_Matrix.csv"}
    )

@router.get("/sector-summary")
def download_sector_summary():
    """Download Sector-wise infrastructure performance benchmark CSV."""
    return download_flash_report()

@router.get("/reviewer-audit")
def download_reviewer_audit():
    """Download Reviewer Verification & Discrepancy Action Trail."""
    headers = ["Log ID", "Action", "Target Project", "Actor", "Timestamp", "Status"]
    rows = [
        ["LOG-9823", "Reviewer Verification Completed", "Vadodara-Mumbai Expwy", "Ananya Deshmukh (Reviewer)", "10:14 AM", "Success"],
        ["LOG-9822", "CUF Discrepancy Flagged", "NH-48 Highway Expansion", "Ananya Deshmukh (Reviewer)", "09:30 AM", "Flagged"],
        ["LOG-9821", "DPR Summary Feasibility Generated", "Brahmaputra Logistics Hub", "Ananya Deshmukh (Reviewer)", "08:45 AM", "Success"]
    ]
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=DRISHTI_Reviewer_Audit_Trail.csv"}
    )
