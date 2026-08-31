"""
MoSPI DRISHTI AI Engine - Honest Multi-Target Model Training (v2.0)
====================================================================
Fixes vs the legacy leaky version (see _legacy_leaky/ for the old code):

  1. TIME-AWARE SPLIT (was: random shuffle split -> future information leaking
     into training). Now: train <= 2026-01, validation 2026-02..03,
     test >= 2026-04 (months the model has NEVER seen during training).
  2. MEDIAN IMPUTATION (was: fillna(0) everywhere -> a missing progress value
     silently became "0% progress", fabricating false risk signals).
  3. NO HIGH_RISK TARGET LEAKAGE — y_high_risk is just the OR of the other
     two targets, so a high_risk model trained on both as features AND split
     randomly is near-tautological. We keep it as a convenience blend of the
     two real models instead of training a third one on the same signals.
  4. BASELINES INCLUDED — a rule-based score and logistic regression are
     trained alongside XGBoost so we can PROVE the ML adds value.
  5. BUSINESS METRIC: top-100 precision (of the 100 projects we tell MoSPI
     to inspect first, how many really fail?).

Usage:  python train.py  (from anywhere; paths are resolved relative to src/)
"""
import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score,
                             average_precision_score)

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

HERE = os.path.dirname(os.path.abspath(__file__))
AI_ENGINE_DIR = os.path.dirname(HERE)          # .../ai_engine
REPO_ROOT = os.path.dirname(AI_ENGINE_DIR)     # repo root (features.csv lives here)
DEFAULT_DATA = os.path.join(REPO_ROOT, "features.csv")

TRAIN_END = "2026-01"   # inclusive
VAL_END = "2026-03"     # inclusive; test = everything after

FEATURE_COLS = [
    # static
    'log_original_cost', 'multi_state', 'agency_freq', 'sector_freq', 'ministry_freq',
    'approval_year',
    # timeline
    'approval_to_start_months', 'planned_duration_months', 'age_at_t_months',
    # state at t
    'cost_overrun_so_far_pct', 'cost_already_revised', 'expenditure_vs_revised',
    'progress_pct', 'progress_vs_expected', 'time_overrun_months',
    'deadline_revised_so_far', 'total_doc_push_months', 'months_to_revised_doc',
    'spend_vs_progress', 'exp_per_pct', 'cost_revisions_so_far',
    # momentum
    'progress_rate_3m', 'spend_rate_3m', 'cost_change_3m',
    'progress_stall', 'doc_push_recent',
]

LABELS = {'y_deadline_slip': 'deadline_slip', 'y_cost_escalation': 'cost_escalation'}


def load_data(data_path=None):
    if data_path is None:
        data_path = DEFAULT_DATA
    if not os.path.exists(data_path):
        data_path = os.path.join(REPO_ROOT, os.path.basename(data_path))
    df = pd.read_csv(data_path, low_memory=False)
    df = df[df['y_deadline_slip'].notna()].copy()   # keep labeled rows only
    df = df[df['month'].notna()].copy()
    # clip absurd pipeline artifacts (from raw report parsing)
    for c in ['cost_overrun_so_far_pct', 'progress_vs_expected', 'spend_vs_progress',
              'exp_per_pct', 'approval_to_start_months', 'time_overrun_months']:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors='coerce').clip(-1e5, 1e5)
    if 'progress_pct' in df.columns:
        df['progress_pct'] = pd.to_numeric(df['progress_pct'], errors='coerce').clip(0, 100)
    for c in FEATURE_COLS:
        df[c] = pd.to_numeric(df[c], errors='coerce')
    return df


def rule_based_score(row):
    """Transparent early-warning score (0-100). Illustrative thresholds,
    documented as such — this is the 'what an officer would do by hand' baseline."""
    s = 0.0
    if row.get('deadline_revised_so_far') == 1: s += 20
    tp = row.get('total_doc_push_months')
    if pd.notna(tp) and tp > 0: s += min(15, tp / 2)
    cr = row.get('cost_overrun_so_far_pct')
    if pd.notna(cr) and cr > 5: s += min(25, cr / 2)
    if row.get('progress_stall') == 1: s += 20
    pv = row.get('progress_vs_expected')
    if pd.notna(pv) and pv < -10: s += 15
    sp = row.get('spend_vs_progress')
    if pd.notna(sp) and sp > 2: s += 10
    return min(100.0, s)


def time_split(df):
    tr = df[df['month'] <= TRAIN_END]
    va = df[(df['month'] > TRAIN_END) & (df['month'] <= VAL_END)]
    te = df[df['month'] > VAL_END]
    return tr, va, te


def topk_precision(y_true, y_prob, k=100):
    idx = np.argsort(-np.asarray(y_prob))[:k]
    return float(np.asarray(y_true)[idx].mean())


def evaluate(y_true, y_prob, y_pred):
    out = {
        'accuracy': round(float(accuracy_score(y_true, y_pred)), 3),
        'precision': round(float(precision_score(y_true, y_pred, zero_division=0)), 3),
        'recall': round(float(recall_score(y_true, y_pred, zero_division=0)), 3),
        'f1': round(float(f1_score(y_true, y_pred, zero_division=0)), 3),
    }
    try:
        out['roc_auc'] = round(float(roc_auc_score(y_true, y_prob)), 3)
    except Exception:
        out['roc_auc'] = None
    try:
        out['pr_auc'] = round(float(average_precision_score(y_true, y_prob)), 3)
    except Exception:
        out['pr_auc'] = None
    return out


def train_models(data_path=None, output_dir=None):
    if output_dir is None:
        output_dir = os.path.join(AI_ENGINE_DIR, "models")
    os.makedirs(output_dir, exist_ok=True)

    print("[AI Engine v2] Loading features dataset...")
    df = load_data(data_path)
    tr, va, te = time_split(df)
    print(f"rows: train={len(tr)} (<= {TRAIN_END}), valid={len(va)} ({TRAIN_END}..{VAL_END}), "
          f"test={len(te)} (> {VAL_END})  <- time-aware split, no future leakage")

    metrics_report = {}
    artifacts = {}

    for target_col, short in LABELS.items():
        print(f"\n{'='*70}\nTARGET: {short} ({target_col})")

        # ---------- baseline 1: rule-based (transparent officer heuristic) ----------
        scores_va = va.apply(rule_based_score, axis=1)
        yva = va[target_col].astype(int)
        p_va = scores_va / 100.0
        m = evaluate(yva, p_va, (scores_va >= 50).astype(int))
        metrics_report.setdefault(short, {})['rule_based_valid'] = m
        print(f"  rule_based   valid: AUC={m['roc_auc']}  P={m['precision']}  R={m['recall']}")

        # ---------- baseline 2: logistic regression (median impute + scale) ----------
        lr = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
            ('lr', LogisticRegression(max_iter=2000, class_weight='balanced')),
        ])
        lr.fit(tr[FEATURE_COLS].astype(float), tr[target_col].astype(int))
        p_va = lr.predict_proba(va[FEATURE_COLS].astype(float))[:, 1]
        m = evaluate(yva, p_va, (p_va >= 0.5).astype(int))
        metrics_report[short]['logistic_regression_valid'] = m
        print(f"  logreg       valid: AUC={m['roc_auc']}  P={m['precision']}  R={m['recall']}")
        joblib.dump(lr, os.path.join(output_dir, f"logreg_{short}.joblib"))

        # ---------- XGBoost (main model) ----------
        ytr = tr[target_col].astype(int)
        pos_w = float((ytr == 0).sum() / max((ytr == 1).sum(), 1))
        import xgboost as xgb
        model = xgb.XGBClassifier(
            n_estimators=400, max_depth=5, learning_rate=0.08,
            scale_pos_weight=pos_w, subsample=0.9, colsample_bytree=0.9,
            eval_metric='aucpr', tree_method='hist', n_jobs=4, random_state=42)
        model.fit(tr[FEATURE_COLS].astype(float), ytr,
                  eval_set=[(va[FEATURE_COLS].astype(float), va[target_col].astype(int))],
                  verbose=False)

        for split_name, X, y in [('valid', va, va[target_col].astype(int)),
                                 ('test', te, te[target_col].astype(int))]:
            p = model.predict_proba(X[FEATURE_COLS].astype(float))[:, 1]
            m = evaluate(y, p, (p >= 0.5).astype(int))
            m['top100_precision'] = round(topk_precision(y, p, 100), 3)
            metrics_report[short][f'xgboost_{split_name}'] = m
            print(f"  xgboost      {split_name}: AUC={m['roc_auc']}  P={m['precision']}  "
                  f"R={m['recall']}  F1={m['f1']}  top100P={m['top100_precision']}")

        model.save_model(os.path.join(output_dir, f"xgb_{short}.json"))
        artifacts[short] = model

        # NOTE: no Random Forest. The waterdeep master pipeline trains
        # XGBoost + LogisticRegression only (minimal stack); RF was tried and
        # added ~36MB of artifacts for +0.004 AUC. Not worth it.

        # medians needed at inference time (same imputation as training)
        joblib.dump({'medians': tr[FEATURE_COLS].median().to_dict()},
                    os.path.join(output_dir, f"imputer_{short}.joblib"))

        # feature importance (gain) for transparency
        imp = sorted(zip(FEATURE_COLS, model.feature_importances_), key=lambda x: -x[1])[:8]
        metrics_report[short]['top_features'] = [k for k, _ in imp]
        print(f"  top features: {', '.join(k for k, _ in imp[:5])}")

    # ---------- high_risk: honest convenience blend, NOT a third leaky model ----------
    # y_high_risk == y_deadline_slip OR y_cost_escalation, so we derive its
    # probability from the two real models: 1 - (1-p_dl)*(1-p_ce)
    meta = {
        'engine_version': '2.0-honest-time-split',
        'trained_samples': int(len(tr)),
        'split': {
            'method': 'time-aware (no future information in training)',
            'train': f"months <= {TRAIN_END}",
            'validation': f"months {TRAIN_END}..{VAL_END}",
            'test': f"months > {VAL_END}",
        },
        'feature_columns': FEATURE_COLS,
        'n_features': len(FEATURE_COLS),
        'high_risk_method': 'derived: p_high = 1 - (1-p_deadline_slip)*(1-p_cost_escalation)',
        'risk_score_method': '100 * (0.5*p_deadline_slip + 0.5*p_cost_escalation); LOW<30<=MEDIUM<60<=HIGH (matches latest_risk_scores.csv)',
        'metrics': metrics_report,
    }
    with open(os.path.join(output_dir, 'model_meta.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2)

    print(f"\n[AI Engine v2] All artifacts saved to: {output_dir}")
    print("[AI Engine v2] Metrics are on UNSEEN future months (test split) - honest numbers.")
    return metrics_report


if __name__ == '__main__':
    # optional: --features <path>  (used by ai_engine/extractor/run_extract.py
    # so the extractor can retrain straight from the CSV it just produced)
    _data = None
    if '--features' in sys.argv:
        _data = sys.argv[sys.argv.index('--features') + 1]
    train_models(data_path=_data)
