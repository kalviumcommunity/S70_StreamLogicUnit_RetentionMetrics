# Retention Cohort Logic

## Correlation method
Primary method: Spearman (engagement data is typically skewed by power users).
Pearson will also be checked once real distributions are visible in the Day 10 EDA notebook.

## Cohort definition
Cohort = users grouped by [signup month / first-session month]
Retention rate per cohort = % of users in that cohort still active [N] days later

## Why this approach
[one or two sentences justifying the choice, tied to what you expect the data to look like]
