# RiskPulse — Explainable Industrial Safety Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Compliance](https://img.shields.io/badge/Compliance-OSHA%20%7C%20ISO%2045001-green.svg)](#)
[![Architecture](https://img.shields.io/badge/System-3--Layer%20Architecture-indigo.svg)](#)

> **Predict Industrial Catastrophes Before Accidents Happen.**  
> RiskPulse studies historical maintenance records, equipment failure logs, inspection reports, safety audits, and operational sensor readings (pressure, temperature, vibration) to spot patterns pointing to safety hazards before accidents occur.

---

## 🌟 Key Features

1. **Deterministic Risk Scoring Engine (0–100)**: Evaluates maintenance delinquencies, recent failure recurrence/severity, sensor telemetry deviations, and audit violations.
2. **Plain-Language Explainability**: Translates complex multi-modal sensor readings and log patterns into clear, human-understandable explanations for floor inspectors.
3. **Actionable Recommendations**: Recommends immediate safety shutdowns, diagnostic overhauls, sensor calibrations, or routine monitoring.
4. **Ranked Inspection Priority Queue**: Orders plant assets by catastrophic risk so inspectors visit the most hazardous equipment first.
5. **Tamper-Evident Audit Trail**: Every score, threshold comparison, and recommendation is logged with UTC timestamps and raw input snapshots.
6. **Messy Data Resilience**: Handles missing data, inconsistent intervals, and sensor drift gracefully without failing.
7. **Produx-Inspired Interactive UI**: A dark-mode landing page with a live risk simulator, telemetry gauges, priority queue filters, and downloadable safety dossiers.

---

## 🏗️ The 3-Layer Architecture

- **Layer 1: Directive (`directives/`)**
  - Standard Operating Procedures (SOPs) written in Markdown.
  - [directives/risk_pulse_pipeline.md](directives/risk_pulse_pipeline.md)
  - [directives/realtime_sync_automation.md](directives/realtime_sync_automation.md)
  - [directives/iot_integration_architecture.md](directives/iot_integration_architecture.md) — future production-scale target.

- **Layer 2: Orchestration**
  - Decision-making layer routing workflows and executing tools deterministically.

- **Layer 3: Execution (`execution/`)**
  - [execution/generate_mock_data.py](execution/generate_mock_data.py) — Realistic industrial dataset generator.
  - [execution/risk_engine.py](execution/risk_engine.py) — Deterministic risk calculation and explanation engine.
  - [execution/audit_trail.py](execution/audit_trail.py) — Tamper-evident audit logger.
  - [execution/run_pipeline.py](execution/run_pipeline.py) — End-to-end batch pipeline runner.
  - [execution/api_server.py](execution/api_server.py) — Live sync API: simulates streaming telemetry, rescoring continuously and pushing updates to the dashboard over WebSocket.

---

## 🚀 Getting Started

### 1. View the Web Application / Landing Page
Open `index.html` in any modern web browser or serve it locally:
```bash
# Optional: run a local server
npx serve .
# or
python -m http.server 8000
```

### 2. Run the Python Pipeline (one-off batch scoring)
```bash
python execution/run_pipeline.py
```

Outputs will be generated in `.tmp/`:
- `.tmp/raw_assets_data.json` — Ingested asset dataset.
- `.tmp/risk_assessment_results.json` — Scored and ranked assessments.
- `.tmp/audit_log.jsonl` — Immutable audit trail entries.

### 3. Run the Live Sync API (real-time automation)
The API wraps the same risk engine but keeps running: on an interval it drifts sensor
telemetry (standing in for a live feed), rescoring the fleet, logging any risk-level
transitions to the audit trail, and pushing updates to the dashboard over WebSocket.
See [directives/realtime_sync_automation.md](directives/realtime_sync_automation.md) for the full design.

```bash
pip install -r requirements.txt
uvicorn execution.api_server:app --reload --port 8787
```

Then open `index.html` as usual — it connects to `ws://127.0.0.1:8787/ws/live`
automatically and falls back to the static demo data if the API isn't running.

Key endpoints:
- `GET /api/assets` — current ranked risk assessments
- `GET /api/audit-log?limit=50` — recent audit trail entries
- `POST /api/refresh` — force an immediate sync tick
- `POST /api/simulate-surge/{asset_id}` — inject a surge on a specific asset for demos
- `WS /ws/live` — live evaluation snapshots/updates

Configurable via `.env`: `SYNC_INTERVAL_SECONDS` (default `5`), `RISKPULSE_DATA_FILE`, `RISKPULSE_AUDIT_LOG`.

---

## 📊 Repository
- **GitHub Repository**: [https://github.com/ubair-khan/SPIH078.git](https://github.com/ubair-khan/SPIH078.git)
