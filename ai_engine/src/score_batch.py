"""
score_batch.py — batch scorer for the team repo (SIH26k).

Generates the ML hand-off files INSIDE this repo, so the platform team never
needs access to anything else:

  ai_engine/outputs/risk_api_output.json    one entry per live project (latest
                                            report month), pre-scored + real
                                            SHAP receipt, sorted by risk desc
  ai_engine/outputs/model_metrics.csv       metrics table for the Model
                                            Performance page (render verbatim)
  ai_engine/outputs/shap_summary_<target>.csv   global driver ranking (charts)

Uses the SAME trained models and the SAME scoring convention as predict.py
(the live /predict-risk endpoint), so batch scores and live scores agree by
construction. The run ends with a verification pass that proves it on sample
projects.

Run:  python ai_engine/src/score_batch.py
"""
import os
import re
import sys
import json

import numpy as np
import pandas as pd
import xgboost as xgb
import shap

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from predict import ENGINE_VERSION, FRIENDLY  # noqa: E402

BASE = os.path.dirname(os.path.dirname(HERE))            # repo root (SIH26k)
FEATURES_CSV = os.path.join(BASE, "features.csv")
MODELS_DIR = os.path.join(BASE, "ai_engine", "models")
OUT_DIR = os.path.join(BASE, "ai_engine", "outputs")

TARGETS = ("deadline_slip", "cost_escalation")


# --------------------------------------------------------------------- utils
def load_meta():
    with open(os.path.join(MODELS_DIR, "model_meta.json"), encoding="utf-8") as fh:
        return json.load(fh)


def split_masks(meta, months: pd.Series):
    """Recompute valid/test row masks from the split description in meta."""
    split = meta.get("split", {})
    valid = pd.Series(False, index=months.index)
    test = pd.Series(False, index=months.index)
    v = re.findall(r"(20\d\d-\d\d)", str(split.get("validation", "")))
    if len(v) >= 2:
        valid = (months >= v[0]) & (months <= v[1])
    t = re.findall(r"(20\d\d-\d\d)", str(split.get("test", "")))
    if t:
        test = months > t[0]
    return valid, test


def metrics_rows(meta, feats):
    """Flatten meta['metrics'] into model_metrics.csv rows (same shape as the
    master pipeline's table). n / pos_rate recomputed from features.csv."""
    rows = []
    for target in TARGETS:
        label_col = "y_deadline_slip" if target == "deadline_slip" else "y_cost_escalation"
        valid_mask, test_mask = split_masks(meta, feats["month"])
        lab = feats[label_col_name(target)]
        for key, m in meta.get("metrics", {}).get(target, {}).items():
            if not isinstance(m, dict) or "roc_auc" not in m:
                continue
            if key.startswith("rule_based"):
                continue  # handoff table = XGBoost vs LogisticRegression only
            if "_valid" in key:
                mask, split_name = valid_mask, "valid"
            elif "_test" in key:
                mask, split_name = test_mask, "test"
            else:
                continue
            sub = lab[mask & lab.notna()]
            model = key.rsplit("_", 1)[0]
            rows.append({
                "target": target,
                "model": f"{model} ({split_name})",
                "n": int(mask.sum()),
                "pos_rate": round(float(lab[mask].mean()), 3),
                "accuracy": round(m.get("accuracy", float("nan")), 3),
                "precision": round(m.get("precision", float("nan")), 3),
                "recall": round(m.get("recall", float("nan")), 3),
                "f1": round(m.get("f1", float("nan")), 3),
                "roc_auc": round(m.get("roc_auc", float("nan")), 3),
                "pr_auc": round(m.get("pr_auc", float("nan")), 3),
            })
            if split_name == "test" and "top100_precision" in m:
                rows.append({
                    "target": target,
                    "model": f"{model} top-100 precision ({split_name})",
                    "n": 100, "pos_rate": "", "accuracy": "",
                    "precision": round(m["top100_precision"], 2),
                    "recall": "", "f1": "", "roc_auc": "", "pr_auc": "",
                })
    return rows


def label_col_name(target):
    return {"deadline_slip": "y_deadline_slip", "cost_escalation": "y_cost_escalation"}[target]


def risk_level(score: float) -> str:
    # SAME convention as predict.py (live API): Critical>=75 High>=60 Medium>=30
    if score >= 75: return "Critical"
    if score >= 60: return "High"
    if score >= 30: return "Medium"
    return "Low"


# ----------------------------------------------------------------------- main
def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    meta = load_meta()

    feats = pd.read_csv(FEATURES_CSV, low_memory=False)
    max_month = feats["month"].max()
    # metrics are computed on the FULL time span (all months); only the
    # per-project scoring below is restricted to the latest report month
    metrics_feats = feats.copy()
    feats = feats[feats["month"] == max_month]
    feats = feats.sort_values("month").groupby("stable_id", as_index=False).last()
    print(f"scoring CURRENT portfolio: {len(feats)} projects as of {max_month}")

    feature_cols = meta.get("feature_columns") or []
    if not feature_cols:
        from predict import FEATURE_COLS_FALLBACK
        feature_cols = FEATURE_COLS_FALLBACK

    models = {}
    for short in TARGETS:
        m = xgb.XGBClassifier()
        m.load_model(os.path.join(MODELS_DIR, f"xgb_{short}.json"))
        models[short] = m

    X = feats[feature_cols].astype(float)

    # ---------- probabilities (identical formula to predict.py) ----------
    p_dl = models["deadline_slip"].predict_proba(X)[:, 1]
    p_ce = models["cost_escalation"].predict_proba(X)[:, 1]
    risk_score = 100.0 * (0.5 * p_dl + 0.5 * p_ce)

    # ---------- global SHAP summaries (for the ExplainableAI page) ----------
    sv = {}
    for short, m in models.items():
        expl = shap.TreeExplainer(m)
        s = expl.shap_values(X)
        sv[short] = s
        mean_abs = np.abs(s).mean(axis=0)
        sdf = (pd.DataFrame({"feature": feature_cols, "mean_abs_shap": mean_abs})
               .sort_values("mean_abs_shap", ascending=False))
        sdf.to_csv(os.path.join(OUT_DIR, f"shap_summary_{short}.csv"), index=False)
        print(f"\n=== {short}: global risk drivers (SHAP) ===")
        for _, r in sdf.head(6).iterrows():
            label, _ = FRIENDLY.get(r["feature"], (r["feature"], ""))
            print(f"  {r['feature']:26s} {r['mean_abs_shap']:.4f}  ({label})")

    # ---------- per-project JSON ----------
    out = []
    for i, (_, row) in enumerate(feats.iterrows()):
        risk_types = []
        if p_dl[i] > 0.5: risk_types.append("TIME_OVERRUN")
        if p_ce[i] > 0.5: risk_types.append("COST_ESCALATION")
        if row.get("progress_stall") == 1: risk_types.append("PROGRESS_STAGNATION")

        drivers = []
        contrib = {}
        for f, v in zip(feature_cols, sv["deadline_slip"][i]):
            contrib[f] = contrib.get(f, 0.0) + abs(float(v))
        for f, v in zip(feature_cols, sv["cost_escalation"][i]):
            contrib[f] = contrib.get(f, 0.0) + abs(float(v))
        for f, imp in sorted(contrib.items(), key=lambda x: -x[1])[:4]:
            if imp < 0.02:
                continue
            raw = row.get(f)
            if raw is None or (isinstance(raw, float) and np.isnan(raw)):
                continue
            label, desc = FRIENDLY.get(f, (f, ""))
            val = round(float(raw), 2) if isinstance(raw, (int, float, np.floating)) else raw
            drivers.append({
                "key": f, "label": label, "value": val,
                "impact": "high" if imp > 0.3 else ("medium" if imp > 0.1 else "low"),
                "message": f"{desc}. Current value: {val}.",
            })
        if not drivers:
            drivers.append({"key": "none", "label": "No strong adverse signals",
                            "value": 0, "impact": "low",
                            "message": "Project shows no dominant risk driver in the current snapshot."})

        out.append({
            "project_id": row["stable_id"],
            "project_name": str(row["project_name"])[:100],
            "ministry": row["ministry"],
            "sector": row["sector"],
            "state": row["state"],
            "implementing_agency": row.get("agency"),
            "as_of_month": row["month"],
            "risk_score": round(float(risk_score[i]), 1),
            "risk_level": risk_level(risk_score[i]),
            "cost_overrun_probability": round(float(p_ce[i]), 3),
            "time_overrun_probability": round(float(p_dl[i]), 3),
            "risk_types": risk_types,
            "top_risk_drivers": drivers,
            "prediction_method": "xgboost+shap",
            "model_version": ENGINE_VERSION,
        })

    out.sort(key=lambda d: -d["risk_score"])
    json_path = os.path.join(OUT_DIR, "risk_api_output.json")
    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2)

    # ---------- model_metrics.csv (from the FULL span, not just July) ----------
    rows = metrics_rows(meta, metrics_feats)
    import csv
    metrics_path = os.path.join(OUT_DIR, "model_metrics.csv")
    if rows:
        with open(metrics_path, "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)

    # ---------- summary ----------
    import collections
    counts = collections.Counter(d["risk_level"] for d in out)
    print(f"\nrisk API output -> {os.path.relpath(json_path, BASE)} ({len(out)} projects)")
    print(f"  Critical={counts.get('Critical',0)}  High={counts.get('High',0)}  "
          f"Medium={counts.get('Medium',0)}  Low={counts.get('Low',0)}")
    if rows:
        print(f"metrics table  -> {os.path.relpath(metrics_path, BASE)} ({len(rows)} rows)")
    print("\n=== top 5 riskiest projects (demo lines) ===")
    for d in out[:5]:
        print(f"  [{d['risk_level']:8s}] {d['risk_score']:5.1f}  {d['project_name'][:60]}")

    # ---------- verification: batch == live predictor ----------
    print("\n=== verification: batch vs live predictor (sample) ===")
    from predict import get_predictor
    pred = get_predictor()
    order = np.argsort(-risk_score)
    ok = True
    for pos in (order[0], len(order) // 2, order[-1]):   # worst / median / best
        row = feats.iloc[pos]
        live = pred.predict_project({k: row.get(k) for k in feature_cols})
        batch = float(risk_score[pos])
        diff = abs(live["risk_score"] - batch)
        ok &= diff <= 0.05
        print(f"  batch={batch:5.1f}  live={live['risk_score']:5.1f}  diff={diff:.2f}  "
              f"[{row['project_name'][:45]}]")
    print("  VERIFIED: batch and live agree" if ok else "  MISMATCH — investigate!")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
