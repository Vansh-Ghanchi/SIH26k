"""
MoSPI DRISHTI AI Engine - Honest Inference & Explainability (v2.0)
===================================================================
Drop-in replacement for the legacy predictor: same class name
(DrishtiPredictor), same get_predictor() singleton, same output keys —
the FastAPI backend (backend/app/api/v1/predictions.py) needs zero changes.

What changed vs _legacy_leaky/predict.py:
  - models: honest XGBoost trained on a TIME-AWARE split (train <= 2026-01,
    test = months after 2026-03) instead of a leaky random split
  - imputation: per-feature training MEDIANS instead of fillna(0) (a missing
    progress value no longer pretends to be "0% progress")
  - high_risk probability is DERIVED (p = 1-(1-p_dl)*(1-p_ce)) instead of a
    third model trained tautologically on the other two targets
  - top_risk_drivers: REAL per-project SHAP values from the actual model,
    not 5 hardcoded factors identical for every project
"""
import os
import joblib
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(os.path.dirname(HERE), "models")
ENGINE_VERSION = "2.0-honest-time-split"


class DrishtiPredictor:
    def __init__(self, models_dir=None):
        self.models_dir = models_dir or MODELS_DIR
        self.models = {}
        self.feature_cols = []
        self.imputers = {}
        self.meta = {}
        self._load_models()

    # ------------------------------------------------------------------ load
    def _load_models(self):
        import xgboost as xgb
        for short in ('deadline_slip', 'cost_escalation'):
            path = os.path.join(self.models_dir, f"xgb_{short}.json")
            if os.path.exists(path):
                m = xgb.XGBClassifier()
                m.load_model(path)
                self.models[short] = m
        meta_path = os.path.join(self.models_dir, "model_meta.json")
        if os.path.exists(meta_path):
            import json
            with open(meta_path, encoding='utf-8') as fh:
                self.meta = json.load(fh)
        if self.meta:
            self.feature_cols = self.meta.get('feature_columns', [])
        if not self.feature_cols:
            self.feature_cols = FEATURE_COLS_FALLBACK
        for short in self.models:
            imp_path = os.path.join(self.models_dir, f"imputer_{short}.joblib")
            if os.path.exists(imp_path):
                self.imputers[short] = joblib.load(imp_path).get('medians', {})

    # --------------------------------------------------------------- helpers
    def _impute(self, project_data: dict) -> dict:
        """Imputation policy (matches how each model was trained):
        - key present but NaN/invalid  -> passed through as NaN. The XGBoost
          models were TRAINED with NaN present (native missing-value handling),
          so passing NaN reproduces the training/batch-scorer behaviour exactly.
        - key ABSENT (e.g. frontend form omits it) -> training-window median,
          the same neutral value the batch imputer uses.
        """
        medians = self.imputers.get('deadline_slip', {})
        out = {}
        for col in self.feature_cols:
            if col not in project_data or project_data[col] is None:
                out[col] = float(medians.get(col, 0.0))
                continue
            try:
                val = float(project_data[col])
            except (TypeError, ValueError):
                val = float(medians.get(col, 0.0))
            if isinstance(val, float) and np.isnan(val):
                out[col] = np.nan   # genuine missing value -> let XGBoost handle it
            else:
                out[col] = val
        return out

    @staticmethod
    def _level_from_prob(p: float) -> str:
        """Legacy helper kept for reference; risk levels now follow the batch
        scorer convention (see predict_project)."""
        if p >= 0.70: return "Critical"
        if p >= 0.40: return "High"
        if p >= 0.20: return "Medium"
        return "Low"

    # ----------------------------------------------------------------- main
    def predict_project(self, project_data: dict) -> dict:
        feats = self._impute(project_data)
        X = pd.DataFrame([feats])[self.feature_cols]

        results = {
            "risk_score": 0.0,
            "risk_level": "Low",
            "high_risk_probability": 0.0,
            "deadline_slip_probability": 0.0,
            "cost_escalation_probability": 0.0,
            "predicted_delay_months": 0,
            "top_risk_drivers": [],
            "recommendation": "",
            "engine_version": ENGINE_VERSION,
            "split": "time-aware: test = months after 2026-03 (never seen in training)",
        }

        p_dl = p_ce = 0.0
        if 'deadline_slip' in self.models:
            p_dl = float(self.models['deadline_slip'].predict_proba(X)[0, 1])
            results["deadline_slip_probability"] = round(p_dl * 100, 1)
        if 'cost_escalation' in self.models:
            p_ce = float(self.models['cost_escalation'].predict_proba(X)[0, 1])
            results["cost_escalation_probability"] = round(p_ce * 100, 1)

        # high_risk = "any of the two failure modes" probability (union) —
        # kept as its own documented metric, NOT used for the risk level
        p_high = 1.0 - (1.0 - p_dl) * (1.0 - p_ce)
        results["high_risk_probability"] = round(p_high * 100, 1)

        # risk_score/risk_level follow the SAME convention as the batch scorer
        # (train_model.py -> latest_risk_scores.csv) so the live API and the
        # dashboard never disagree:
        #   risk_score = 100 * (0.5*p_deadline_slip + 0.5*p_cost_escalation)
        #   LOW < 30 <= MEDIUM < 60 <= HIGH
        risk_score = 100.0 * (0.5 * p_dl + 0.5 * p_ce)
        results["risk_score"] = round(risk_score, 1)
        # Thresholds match the batch scorer; Critical is an extra top tier
        # (score >= 75 => top ~0.6% of the portfolio, 22 projects) so the
        # frontend's RiskBadge 'Critical' style stays reachable.
        if risk_score >= 75:
            results["risk_level"] = "Critical"
        elif risk_score >= 60:
            results["risk_level"] = "High"
        elif risk_score >= 30:
            results["risk_level"] = "Medium"
        else:
            results["risk_level"] = "Low"

        # delay-months heuristic kept from legacy (transparent, documented)
        time_overrun = feats.get('time_overrun_months', 0.0)
        stall = feats.get('progress_stall', 0.0)
        time_overrun = 0.0 if time_overrun is None or (isinstance(time_overrun, float) and np.isnan(time_overrun)) else float(time_overrun)
        stall = 0.0 if stall is None or (isinstance(stall, float) and np.isnan(stall)) else float(stall)
        results["predicted_delay_months"] = max(0, int(time_overrun + stall * 4 + p_dl * 6))

        # ---------- REAL per-project SHAP explanations ----------
        drivers = self._shap_drivers(feats)
        results["top_risk_drivers"] = drivers

        if results["risk_level"] in ("Critical", "High"):
            results["recommendation"] = ("Immediate IPMD Inter-Ministerial Taskforce Review required. "
                                         "Freeze non-critical disbursements and conduct contractor liquidity audit.")
        elif results["risk_level"] == "Medium":
            results["recommendation"] = ("Monthly milestone escalation triggered. Review Right of Way (RoW) "
                                         "clearances and fast-track utility shifting.")
        else:
            results["recommendation"] = ("Project progress tracking within standard tolerance envelope. "
                                         "Continue automated monitoring.")

        return results

    # ------------------------------------------------------------ shap part
    def _shap_drivers(self, feats: dict):
        try:
            import shap
        except ImportError:
            return self._fallback_drivers(feats)
        drivers = []
        for short in ('deadline_slip', 'cost_escalation'):
            if short not in self.models:
                continue
            X = pd.DataFrame([feats])[self.feature_cols]
            sv = shap.TreeExplainer(self.models[short]).shap_values(X)
            contrib = {}
            for f, v in zip(self.feature_cols, sv[0]):
                contrib[f] = contrib.get(f, 0.0) + abs(float(v))
            total = sum(contrib.values()) or 1.0
            for f, imp in sorted(contrib.items(), key=lambda x: -x[1])[:4]:
                label, desc = FRIENDLY.get(f, (f, ""))
                raw = feats.get(f)
                share = imp / total  # share of this model's risk signal
                if raw is None or (isinstance(raw, float) and np.isnan(raw)):
                    raw_out = None   # NaN -> null (valid JSON)
                elif isinstance(raw, (int, float)):
                    raw_out = round(float(raw), 2)
                else:
                    raw_out = raw
                drivers.append({
                    "factor": label,
                    "value": raw_out,
                    "impact": "High" if share > 0.15 else ("Medium" if share > 0.07 else "Low"),
                    "weight": round(share * 100, 1),
                    "message": f"{desc}. Current value: {raw}.",
                    "model": short,
                })
        # dedupe by factor, keep strongest
        best = {}
        for d in drivers:
            if d["factor"] not in best or d["weight"] > best[d["factor"]]["weight"]:
                best[d["factor"]] = d
        return sorted(best.values(), key=lambda d: -d["weight"])[:5]

    def _fallback_drivers(self, feats: dict):
        """If shap isn't installed, derive drivers from feature importances."""
        fi_path = os.path.join(self.models_dir, "feature_importance_deadline_slip.csv")
        rows = []
        if os.path.exists(fi_path):
            import csv
            with open(fi_path, encoding='utf-8') as fh:
                rows = list(csv.DictReader(fh))
        out = []
        for r in rows[:5]:
            f = r.get('feature', '')
            label, desc = FRIENDLY.get(f, (f, ""))
            out.append({
                "factor": label, "value": feats.get(f),
                "impact": "High", "weight": round(float(r.get('importance', 0)) * 100, 1),
                "message": desc, "model": "global",
            })
        return out


FRIENDLY = {
    "time_overrun_months": ("Time overrun", "Months past the original completion date"),
    "progress_stall": ("Progress stall", "Physical progress barely moved recently"),
    "cost_revisions_so_far": ("Repeat cost revisions", "Cost has been revised up multiple times"),
    "cost_already_revised": ("Cost already revised", "Revised cost is above original approved cost"),
    "cost_overrun_so_far_pct": ("Cost overrun so far", "Revised cost is % above original"),
    "deadline_revised_so_far": ("Deadline already pushed", "Completion date has been revised"),
    "total_doc_push_months": ("Deadline push", "Total months the completion date slipped"),
    "months_to_revised_doc": ("Months to deadline", "Time remaining to revised completion"),
    "progress_vs_expected": ("Behind schedule", "Actual progress minus expected progress at this age"),
    "spend_vs_progress": ("Spend vs progress", "Rupees spent per 1% of physical progress"),
    "progress_rate_3m": ("Progress velocity", "Physical progress growth per month (recent)"),
    "spend_rate_3m": ("Spending rate", "Expenditure growth per month (recent)"),
    "cost_change_3m": ("Recent cost change", "Revised cost movement in recent months"),
    "approval_to_start_months": ("Slow start", "Months from approval to construction start"),
    "planned_duration_months": ("Planned duration", "Originally planned project duration"),
    "age_at_t_months": ("Project age", "Months since start"),
    "doc_push_recent": ("Recent deadline push", "Deadline was pushed in recent months"),
    "expenditure_vs_revised": ("Budget consumed", "Share of revised cost already spent"),
    "progress_pct": ("Current progress", "Physical progress percentage"),
    "log_original_cost": ("Project size", "Original approved cost (log scale)"),
    "agency_freq": ("Agency track record", "Number of projects run by this agency"),
    "sector_freq": ("Sector prevalence", "Number of projects in this sector"),
    "ministry_freq": ("Ministry portfolio size", "Number of projects under this ministry"),
    "approval_year": ("Approval year", "Year the project was approved"),
    "multi_state": ("Multi-state project", "Project spans multiple states"),
    "exp_per_pct": ("Cost per progress", "Normalized spend per progress point"),
}

FEATURE_COLS_FALLBACK = [
    'log_original_cost', 'multi_state', 'agency_freq', 'sector_freq', 'ministry_freq',
    'approval_year', 'approval_to_start_months', 'planned_duration_months', 'age_at_t_months',
    'cost_overrun_so_far_pct', 'cost_already_revised', 'expenditure_vs_revised',
    'progress_pct', 'progress_vs_expected', 'time_overrun_months',
    'deadline_revised_so_far', 'total_doc_push_months', 'months_to_revised_doc',
    'spend_vs_progress', 'exp_per_pct', 'cost_revisions_so_far',
    'progress_rate_3m', 'spend_rate_3m', 'cost_change_3m',
    'progress_stall', 'doc_push_recent',
]

# Singleton instance
_predictor = None

def get_predictor():
    global _predictor
    if _predictor is None:
        _predictor = DrishtiPredictor()
    return _predictor

if __name__ == "__main__":
    predictor = get_predictor()
    sample = {
        "progress_pct": 35.0,
        "time_overrun_months": 12,
        "progress_stall": 1,
        "spend_vs_progress": 1.85,
        "log_original_cost": 6.5
    }
    print("Sample Prediction Output (honest engine v2.0):")
    import pprint
    pprint.pprint(predictor.predict_project(sample))
