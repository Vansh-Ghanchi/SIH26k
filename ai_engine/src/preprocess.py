"""
MoSPI DRISHTI AI Engine - Data Preprocessing & Pipeline (v2.0)

Consistent with the honest training/inference pipeline:
  - NO blanket fillna(0): a missing progress value is NOT "0% progress".
    Genuine NaNs are left for XGBoost's native missing-value handling,
    exactly as the models were trained.
  - y_high_risk is NOT treated as a learnable third target (it is just the
    OR of the other two labels) — it is documented as a derived metric.
"""
import os
import pandas as pd
import numpy as np

# Must match FEATURE_COLS in train.py / predict.py
FEATURE_COLS = [
    'log_original_cost', 'multi_state', 'agency_freq', 'sector_freq', 'ministry_freq',
    'approval_year',
    'approval_to_start_months', 'planned_duration_months', 'age_at_t_months',
    'cost_overrun_so_far_pct', 'cost_already_revised', 'expenditure_vs_revised',
    'progress_pct', 'progress_vs_expected', 'time_overrun_months',
    'deadline_revised_so_far', 'total_doc_push_months', 'months_to_revised_doc',
    'spend_vs_progress', 'exp_per_pct', 'cost_revisions_so_far',
    'progress_rate_3m', 'spend_rate_3m', 'cost_change_3m',
    'progress_stall', 'doc_push_recent',
]

TARGET_COLS = ['y_deadline_slip', 'y_cost_escalation', 'y_high_risk']


def load_features_dataset(filepath="features.csv"):
    """
    Loads features.csv and coerces columns to numeric.

    NOTE: missing values are intentionally preserved as NaN (not zero-filled)
    so inference matches how the models were trained.
    """
    if not os.path.exists(filepath):
        filepath = os.path.join(os.path.dirname(__file__), "..", "..", filepath)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"features.csv not found (tried: {filepath})")

    df = pd.read_csv(filepath, low_memory=False)

    for col in FEATURE_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        else:
            df[col] = np.nan

    for col in TARGET_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    return df, FEATURE_COLS, TARGET_COLS


def time_split(df, train_end="2026-01", val_end="2026-03"):
    """Time-aware split: no future information can leak into training.

    Filters to labeled rows first (exactly like train.py) so the reported
    split sizes match the training run: 6563 / 3466 / 4786.
    """
    if 'y_deadline_slip' in df.columns:
        df = df[df['y_deadline_slip'].notna()]
    if 'month' in df.columns:
        df = df[df['month'].notna()]
    tr = df[df['month'] <= train_end]
    va = df[(df['month'] > train_end) & (df['month'] <= val_end)]
    te = df[df['month'] > val_end]
    return tr, va, te


if __name__ == "__main__":
    df, features, targets = load_features_dataset()
    tr, va, te = time_split(df)
    print(f"Loaded {len(df)} records with {len(features)} features and {len(targets)} targets.")
    print(f"time-aware split -> train={len(tr)}, valid={len(va)}, test={len(te)}")
    print("NOTE: y_high_risk is derived (OR of the other two), not modelled separately.")
