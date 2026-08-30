import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import pandas as pd
from app.db.supabase_client import get_supabase

def normalize_state(val):
    if not isinstance(val, str):
        return "National"
    clean = val.strip()
    if clean.startswith("Airport. "):
        clean = clean.replace("Airport. ", "")
    if "works for" in clean:
        clean = "Kerala"
    if "," in clean:
        parts = [p.strip() for p in clean.split(",") if p.strip()]
        clean = parts[0] if parts else "National"
    return clean or "National"

def seed_supabase_from_csv(csv_path="SIH_PAIMANA_July2025_March2026_24_COLUMNS_FINAL.csv"):
    if not os.path.exists(csv_path):
        csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", csv_path)

    print(f"[Seed] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path, low_memory=False)
    print(f"[Seed] Loaded {len(df)} records across 9 months.")

    supabase = get_supabase()
    if not supabase:
        print("[Seed ERROR] Cannot connect to Supabase. Check SUPABASE_URL and KEYS.")
        return

    # 1. Deduplicate master projects (latest record per project_id)
    # Sort by reporting_month desc to keep latest snapshot for master table
    df_sorted = df.sort_values(by="reporting_month", ascending=False)
    unique_projects = df_sorted.drop_duplicates(subset=["project_id"]).copy()
    print(f"[Seed] Found {len(unique_projects)} unique central infrastructure projects.")

    projects_payload = []
    for _, row in unique_projects.iterrows():
        p_id = str(row.get("project_id", "")).strip()
        if not p_id or p_id == "nan":
            continue

        p_name = str(row.get("project_name", "")).strip()
        state = normalize_state(row.get("state_ut", "National"))

        projects_payload.append({
            "project_id": p_id,
            "project_name": p_name[:500],
            "ministry": str(row.get("ministry", "Others"))[:200],
            "sector": str(row.get("sector", "Infrastructure"))[:200],
            "implementing_agency": str(row.get("implementing_agency", ""))[:200],
            "state_ut": state[:100],
            "approval_date": str(row.get("approval_date", "")),
            "start_date": str(row.get("start_date", "")),
            "original_completion_date": str(row.get("original_completion_date", "")),
            "revised_completion_date": str(row.get("revised_completion_date", "")),
            "original_cost_cr": float(row.get("original_cost_cr", 0.0) or 0.0),
            "revised_cost_cr": float(row.get("revised_cost_cr", 0.0) or 0.0),
            "cumulative_expenditure_cr": float(row.get("cumulative_expenditure_cr", 0.0) or 0.0),
            "physical_progress_pct": float(row.get("physical_progress_pct", 0.0) or 0.0),
            "cost_revision_pct": float(row.get("cost_revision_pct", 0.0) or 0.0),
            "deadline_revision_flag": bool(str(row.get("deadline_revision_flag", "")).lower() == "true"),
            "project_status": str(row.get("project_status", "Ongoing")),
            "data_quality_flag": str(row.get("data_quality_flag", "OK"))
        })

    # Batch upsert into projects table
    BATCH_SIZE = 100
    print(f"[Seed] Upserting {len(projects_payload)} projects to Supabase in batches of {BATCH_SIZE}...")
    
    success_count = 0
    for i in range(0, len(projects_payload), BATCH_SIZE):
        batch = projects_payload[i:i + BATCH_SIZE]
        try:
            res = supabase.table("projects").upsert(batch, on_conflict="project_id").execute()
            success_count += len(batch)
            if (i // BATCH_SIZE) % 5 == 0 or i + BATCH_SIZE >= len(projects_payload):
                print(f"   Processed {min(i + BATCH_SIZE, len(projects_payload))}/{len(projects_payload)} projects...")
        except Exception as e:
            print(f"[Seed ERROR on batch {i}]: {e}", file=sys.stderr)

    print(f"✅ [Seed Completed] Successfully synced {success_count} master projects into Supabase cloud database!")

if __name__ == "__main__":
    seed_supabase_from_csv()
