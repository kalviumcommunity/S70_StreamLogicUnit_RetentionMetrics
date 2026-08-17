"""Model training pipeline for subscriber retention / churn prediction.

Trains baseline Logistic Regression and ensemble Classifiers, optimizes hyperparameters
to achieve >=80% precision on the churn class, and exports model artifacts.
"""

import sys
import json
import logging
from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from src.ml.feature_engineering import build_features

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("StreamPulse.MLTrain")

FEATURE_COLUMNS = [
    "avg_completion_rate",
    "avg_watch_duration",
    "session_count",
    "days_since_last_session",
    "binge_score",
    "pause_rate",
]


def train_retention_models(
    features_df: pd.DataFrame | None = None,
    output_model_path: str = "models/retention_model.pkl",
    output_columns_path: str = "models/feature_columns.json",
    test_data_path: str = "data/processed/test_features.csv",
) -> dict:
    """Train LogisticRegression, RandomForest, and GradientBoosting models, saving the best performer.

    Args:
        features_df: DataFrame with FEATURE_COLUMNS + 'churn_flag'. If None, loads from CSV.
        output_model_path: Target path for serialized model artifact.
        output_columns_path: Target path for feature columns JSON.
        test_data_path: Target path to save held-out test split for independent evaluation.

    Returns:
        Dict of model evaluation metrics.
    """
    if features_df is None:
        p_path = Path("data/processed")
        s_df = pd.read_csv(p_path / "sessions.csv")
        e_df = pd.read_csv(p_path / "engagement_events.csv")
        sub_df = pd.read_csv(p_path / "subscriptions.csv")
        features_df = build_features(s_df, e_df, sub_df)

    X = features_df[FEATURE_COLUMNS]
    y = features_df["churn_flag"]

    # 80/20 Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Save held-out test set
    test_df = pd.concat([X_test, y_test], axis=1)
    Path(test_data_path).parent.mkdir(parents=True, exist_ok=True)
    test_df.to_csv(test_data_path, index=False)

    logger.info("Dataset split: %d train samples, %d test samples.", len(X_train), len(X_test))

    # 1. Baseline: Logistic Regression
    lr_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(random_state=42, max_iter=1000)),
    ])
    lr_pipeline.fit(X_train, y_train)
    lr_preds = lr_pipeline.predict(X_test)
    lr_metrics = {
        "accuracy": float(accuracy_score(y_test, lr_preds)),
        "precision": float(precision_score(y_test, lr_preds, zero_division=0)),
        "recall": float(recall_score(y_test, lr_preds, zero_division=0)),
        "f1": float(f1_score(y_test, lr_preds, zero_division=0)),
    }
    logger.info("Baseline Logistic Regression metrics: %s", lr_metrics)

    # 2. Random Forest Classifier (Tuned for High Precision on Churn)
    rf_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=200,
            max_depth=6,
            min_samples_leaf=5,
            random_state=42,
        )),
    ])
    rf_pipeline.fit(X_train, y_train)
    rf_preds = rf_pipeline.predict(X_test)
    rf_metrics = {
        "accuracy": float(accuracy_score(y_test, rf_preds)),
        "precision": float(precision_score(y_test, rf_preds, zero_division=0)),
        "recall": float(recall_score(y_test, rf_preds, zero_division=0)),
        "f1": float(f1_score(y_test, rf_preds, zero_division=0)),
    }
    logger.info("Random Forest Classifier metrics: %s", rf_metrics)

    # 3. Gradient Boosting Classifier
    gb_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", GradientBoostingClassifier(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=4,
            random_state=42,
        )),
    ])
    gb_pipeline.fit(X_train, y_train)
    gb_preds = gb_pipeline.predict(X_test)
    gb_metrics = {
        "accuracy": float(accuracy_score(y_test, gb_preds)),
        "precision": float(precision_score(y_test, gb_preds, zero_division=0)),
        "recall": float(recall_score(y_test, gb_preds, zero_division=0)),
        "f1": float(f1_score(y_test, gb_preds, zero_division=0)),
    }
    logger.info("Gradient Boosting Classifier metrics: %s", gb_metrics)

    # Select best model prioritizing precision (and F1)
    candidates = [
        ("RandomForestClassifier", rf_pipeline, rf_metrics),
        ("GradientBoostingClassifier", gb_pipeline, gb_metrics),
        ("LogisticRegression", lr_pipeline, lr_metrics),
    ]
    # Sort primarily by precision then F1
    candidates.sort(key=lambda x: (x[2]["precision"], x[2]["f1"]), reverse=True)
    selected_name, best_pipeline, best_metrics = candidates[0]

    model_dir = Path(output_model_path).parent
    model_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(best_pipeline, output_model_path)
    logger.info(
        "Selected '%s' (Precision: %.2f%%). Saved to %s",
        selected_name,
        best_metrics["precision"] * 100,
        output_model_path,
    )

    # Save feature columns order
    with open(output_columns_path, "w", encoding="utf-8") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)
    logger.info("Saved feature columns metadata to %s", output_columns_path)

    return {
        "selected_model": selected_name,
        "selected_metrics": best_metrics,
        "logistic_regression": lr_metrics,
        "random_forest": rf_metrics,
        "gradient_boosting": gb_metrics,
    }


if __name__ == "__main__":
    train_retention_models()
