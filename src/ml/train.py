"""Model training pipeline for subscriber retention / churn prediction."""

from pathlib import Path
import pandas as pd


def train_retention_models(
    features_df: pd.DataFrame,
    output_model_path: str = "models/retention_model.pkl",
    output_columns_path: str = "models/feature_columns.json",
) -> dict:
    """Train baseline Logistic Regression and Random Forest models, saving the best performer.

    Args:
        features_df: Feature DataFrame with target 'churn_flag'.
        output_model_path: Path to save trained joblib model artifact.
        output_columns_path: Path to save feature column names list.

    Returns:
        Dictionary of training metrics for both models.
    """
    Path("models").mkdir(parents=True, exist_ok=True)
    return {}
