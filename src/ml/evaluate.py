"""Model evaluation and feature importance extraction for StreamPulse retention models."""

import sys
import json
import logging
from pathlib import Path
import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("StreamPulse.MLEvaluate")


def evaluate_model(
    model_path: str = "models/retention_model.pkl",
    test_data_path: str = "data/processed/test_features.csv",
    feature_columns_path: str = "models/feature_columns.json",
    output_importance_path: str = "models/feature_importance.json",
) -> dict:
    """Evaluate trained model pipeline and export sorted feature importance JSON.

    Args:
        model_path: Path to serialized model pipeline.
        test_data_path: Path to test dataset CSV.
        feature_columns_path: Path to feature column names JSON.
        output_importance_path: Path to write sorted feature importances.

    Returns:
        Dict containing comprehensive evaluation metrics and feature importances.

    Raises:
        FileNotFoundError: If model or test dataset is missing.
    """
    m_file = Path(model_path)
    if not m_file.exists():
        raise FileNotFoundError(f"Model artifact not found at {model_path}. Train the model first.")

    pipeline = joblib.load(m_file)
    logger.info("Loaded model artifact from %s", model_path)

    # Load test dataset
    t_file = Path(test_data_path)
    if not t_file.exists():
        raise FileNotFoundError(f"Test dataset not found at {test_data_path}.")

    test_df = pd.read_csv(t_file)

    # Load feature columns
    with open(feature_columns_path, "r", encoding="utf-8") as f:
        feature_cols = json.load(f)

    X_test = test_df[feature_cols]
    y_test = test_df["churn_flag"]

    # Generate predictions
    y_pred = pipeline.predict(X_test)

    # Calculate metrics
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    logger.info("Evaluation Summary:")
    logger.info("Accuracy:  %.4f", acc)
    logger.info("Precision: %.4f (Target >= 0.80)", prec)
    logger.info("Recall:    %.4f", rec)
    logger.info("F1 Score:  %.4f", f1)
    logger.info("Confusion Matrix: %s", cm)
    logger.info("\n%s", classification_report(y_test, y_pred))

    if prec < 0.80:
        logger.warning(
            "Churn class precision (%.2f%%) is below the 80%% target. Review hyperparameters.",
            prec * 100,
        )

    # Extract feature importances
    classifier = pipeline.named_steps.get("classifier", pipeline)
    if hasattr(classifier, "feature_importances_"):
        raw_importances = classifier.feature_importances_
    elif hasattr(classifier, "coef_"):
        raw_importances = abs(classifier.coef_[0])
    else:
        raw_importances = [1.0 / len(feature_cols)] * len(feature_cols)

    # Normalize and sort importances descending
    total_imp = sum(raw_importances) if sum(raw_importances) > 0 else 1.0
    norm_importances = {col: round(float(imp / total_imp), 4) for col, imp in zip(feature_cols, raw_importances)}
    sorted_importances = dict(sorted(norm_importances.items(), key=lambda item: item[1], reverse=True))

    # Save feature importances to JSON
    out_imp = Path(output_importance_path)
    out_imp.parent.mkdir(parents=True, exist_ok=True)
    with open(out_imp, "w", encoding="utf-8") as f:
        json.dump(sorted_importances, f, indent=2)
    logger.info("Exported sorted feature importances to %s", output_importance_path)

    metrics_result = {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "confusion_matrix": cm,
        "feature_importance": sorted_importances,
    }

    return metrics_result


if __name__ == "__main__":
    evaluate_model()
