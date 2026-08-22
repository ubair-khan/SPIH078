# RiskRadar — Explainable Industrial Safety Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Compliance](https://img.shields.io/badge/Compliance-OSHA%20%7C%20ISO%2045001-green.svg)](#)
[![Architecture](https://img.shields.io/badge/System-3--Layer%20Architecture-indigo.svg)](#)

> **Predict Industrial Catastrophes Before Accidents Happen.**  
> RiskRadar studies historical maintenance records, equipment failure logs, inspection reports, safety audits, and operational sensor readings (pressure, temperature, vibration) to spot patterns pointing to safety hazards before accidents occur.

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
  - [directives/risk_radar_pipeline.md](directives/risk_radar_pipeline.md)
  - [directives/iot_integration_architecture.md](directives/iot_integration_architecture.md)

- **Layer 2: Orchestration**
  - Decision-making layer routing workflows and executing tools deterministically.

- **Layer 3: Execution (`execution/`)**
  - [execution/generate_mock_data.py](execution/generate_mock_data.py) — Realistic industrial dataset generator.
  - [execution/risk_engine.py](execution/risk_engine.py) — Deterministic risk calculation and explanation engine.
  - [execution/audit_trail.py](execution/audit_trail.py) — Tamper-evident audit logger.
  - [execution/run_pipeline.py](execution/run_pipeline.py) — End-to-end pipeline runner.

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

### 2. Run the Python Pipeline
```bash
python execution/run_pipeline.py
```

Outputs will be generated in `.tmp/`:
- `.tmp/raw_assets_data.json` — Ingested asset dataset.
- `.tmp/risk_assessment_results.json` — Scored and ranked assessments.
- `.tmp/audit_log.jsonl` — Immutable audit trail entries.

---

## 📊 Repository
- **GitHub Repository**: [https://github.com/ubair-khan/SPIH078.git](https://github.com/ubair-khan/SPIH078.git)
