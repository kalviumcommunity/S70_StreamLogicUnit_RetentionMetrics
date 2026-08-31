# Machine Learning & Retention Modeling Specification — StreamPulse

### 1. Problem Formulation
* **Type**: Supervised Binary Classification
* **Target Variable**: `churn_flag` (1 = Churned, 0 = Retained)
* **Goal**: Predict subscriber churn probability with >= 80% precision on the churn class.

### 2. Feature Schema
1. `avg_completion_rate`: Mean percentage of content completed per viewing session.
2. `avg_watch_duration`: Mean session watch duration in minutes.
3. `session_count`: Total active sessions in the observation window.
4. `days_since_last_session`: Recency of activity (inactivity metric).
5. `binge_score`: Ratio of total streaming duration to distinct active days.
6. `pause_rate`: Frequency of pause interruptions per minute streamed.

### 3. Model Architecture & Comparison
* **Baseline**: Logistic Regression with StandardScaler.
* **Ensemble**: Tuned Random Forest Classifier (`n_estimators=200`, `max_depth=6`, `min_samples_leaf=5`).
* **Ensemble**: Gradient Boosting Classifier (`n_estimators=120`, `learning_rate=0.08`).
