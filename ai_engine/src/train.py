"""
MoSPI PAIMANA AI Engine - Multi-Target Predictive Model Training
Trains ensemble classifiers for Early Warnings, High-Risk Overruns, and Deadline Slips.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def train_models(data_path="features.csv", output_dir=None):
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(output_dir, exist_ok=True)

    print("[AI Engine] Loading features dataset...")
    
    # Path resolution
    if not os.path.exists(data_path):
        data_path = os.path.join(os.path.dirname(__file__), "..", "..", data_path)

    df = pd.read_csv(data_path, low_memory=False)

    feature_cols = [
        'log_original_cost', 'multi_state', 'agency_freq', 'sector_freq', 'ministry_freq',
        'approval_to_start_months', 'approval_year', 'planned_duration_months',
        'age_at_t_months', 'cost_overrun_so_far_pct', 'cost_already_revised',
        'expenditure_vs_revised', 'progress_pct', 'progress_vs_expected',
        'time_overrun_months', 'deadline_revised_so_far', 'total_doc_push_months',
        'months_to_revised_doc', 'spend_vs_progress', 'exp_per_pct',
        'progress_rate_3m', 'spend_rate_3m', 'cost_change_3m',
        'progress_stall', 'doc_push_recent', 'cost_revisions_so_far'
    ]

    target_cols = {
        'high_risk': 'y_high_risk',
        'deadline_slip': 'y_deadline_slip',
        'cost_escalation': 'y_cost_escalation'
    }

    # Clean features
    X = pd.DataFrame()
    for col in feature_cols:
        X[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)

    trained_models = {}
    metrics_report = {}

    for model_name, target_col in target_cols.items():
        print(f"\n[AI Engine] Training Ensemble Model for [{model_name}] ({target_col})...")
        y = pd.to_numeric(df[target_col], errors='coerce').fillna(0).astype(int)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Train Random Forest Classifier with optimized hyperparameters
        clf = RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        clf.fit(X_train, y_train)

        # Evaluation
        y_pred = clf.predict(X_test)
        y_prob = clf.predict_proba(X_test)[:, 1] if len(clf.classes_) > 1 else np.zeros(len(y_test))

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc = roc_auc_score(y_test, y_prob) if len(np.unique(y_test)) > 1 else 1.0

        print(f"   Accuracy:  {acc * 100:.2f}%")
        print(f"   Precision: {prec * 100:.2f}%")
        print(f"   Recall:    {rec * 100:.2f}%")
        print(f"   F1-Score:  {f1 * 100:.2f}%")
        print(f"   ROC-AUC:   {roc:.4f}")

        # Feature importances
        importances = dict(zip(feature_cols, clf.feature_importances_))
        sorted_imp = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
        print(f"   Top 5 Risk Drivers: {', '.join([k for k, _ in sorted_imp])}")

        # Save model artifact
        model_file = os.path.join(output_dir, f"{model_name}_model.joblib")
        joblib.dump({
            'model': clf,
            'features': feature_cols,
            'metrics': {'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1, 'roc_auc': roc},
            'top_features': sorted_imp
        }, model_file)

        trained_models[model_name] = clf
        metrics_report[model_name] = {'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1, 'roc_auc': roc}

    # Save meta config
    meta_path = os.path.join(output_dir, "model_meta.json")
    import json
    with open(meta_path, 'w') as f:
        json.dump({
            'trained_samples': len(df),
            'feature_columns': feature_cols,
            'metrics': metrics_report
        }, f, indent=2)

    print(f"\n[AI Engine] All models successfully saved to: {output_dir}")
    return trained_models

if __name__ == "__main__":
    train_models()
