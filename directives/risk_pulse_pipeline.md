# Directive: RiskPulse Industrial Risk Assessment Pipeline

## 1. Objective & Scope
The goal of RiskPulse is to evaluate industrial assets (equipment, processes, facilities) by analyzing historical maintenance logs, failure reports, inspection audits, and operating sensor telemetry (temperature, pressure, vibration). It flags potential hazards **before** incidents occur, explains the rationale in plain language, assigns actionable recommendations, and outputs a prioritized inspection queue with a verifiable audit trail.

---

## 2. Inputs & Data Specifications
Inputs are processed from intermediate storage in `.tmp/` or designated data files:
- **Maintenance Records**: `asset_id`, `last_maintenance_date`, `maintenance_type`, `maintenance_status`, `days_overdue`
- **Failure & Incident Logs**: `asset_id`, `incident_date`, `severity`, `root_cause`, `failure_count_last_90d`
- **Safety Audits & Inspections**: `asset_id`, `audit_score`, `unresolved_violations_count`, `last_audit_date`
- **Operational Sensor Readings**: `asset_id`, `temperature_c`, `pressure_psi`, `vibration_mms`, `baseline_temp`, `baseline_pressure`

*Note on Data Resilience*: Industrial data is messy and may include missing timestamps, null values, or inconsistent casing. The data ingestion module must impute or handle defaults gracefully without failing.

---

## 3. Toolchain & Execution Steps (Layer 3)

### Step 1: Ingest & Clean Data
- **Tool**: `execution/generate_mock_data.py` (for synthetic datasets) or custom data loaders.
- **Output**: `.tmp/raw_assets_data.json`

### Step 2: Risk Scoring & Rule Evaluation
- **Tool**: `execution/risk_engine.py`
- **Functionality**:
  1. Computes composite risk score (0 - 100) based on weighted factors:
     - Maintenance delinquency weight: 25%
     - Recent failure frequency & severity weight: 30%
     - Sensor telemetry anomaly delta (temp/pressure): 30%
     - Unresolved audit citations weight: 15%
  2. Categorizes risk levels:
     - **Low Risk**: Score < 40
     - **Medium Risk**: Score 40 - 69
     - **High Risk**: Score >= 70
  3. Synthesizes human-readable plain language explanations detailing contributing factors.
  4. Prescribes targeted recommendations: `Inspect Immediately`, `Emergency Shutdown`, `Preventive Maintenance`, `Sensor Calibration`, `Routine Monitoring`.
  5. Produces ranked inspection order (descending by risk score and severity).
- **Output**: `.tmp/risk_assessment_results.json`

### Step 3: Audit Trail & Reporting
- **Tool**: `execution/audit_trail.py` / `execution/run_pipeline.py`
- **Functionality**:
  - Emits tamper-evident timestamped audit log entries (`.tmp/audit_log.jsonl`) capturing raw factors, rule outcomes, scores, and decision rationale.
  - Summarizes plant-wide risk distribution and high-priority inspection queue.

---

## 4. Deliverables & Outputs
- Ranked list of high-risk assets with primary risk drivers.
- Complete audit trail for compliance and safety board reviews.
- Export ready summary tables for dashboard consumption or Google Sheets.

---

## 5. Edge Cases & Learnings
- If sensor telemetry is unavailable for an asset, reweight maintenance and audit factors proportionally.
- In cases where an asset has a critical safety violation (score 0 on safety audit or catastrophic failure risk), override composite score to automatically escalate to **High Risk**.
