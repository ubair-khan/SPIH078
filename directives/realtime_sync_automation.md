# Directive: Real-Time Data Sync & Automation

## 1. Objective & Scope
Keep RiskPulse risk assessments continuously in sync with live sensor telemetry instead
of requiring a manual `run_pipeline.py` invocation, and push updates to the dashboard the
moment they happen. This is the lightweight, no-extra-infrastructure implementation of the
streaming concept sketched in `directives/iot_integration_architecture.md` — that document
describes a production-scale target (Kafka/MQTT/OPC-UA/Flink); this directive covers what's
actually built and running today.

---

## 2. Toolchain & Execution Steps (Layer 3)

### Tool: `execution/api_server.py`
A FastAPI service that wraps the existing deterministic tools — it adds no scoring logic
of its own, it only orchestrates them on a loop:

1. **Startup**: loads `.tmp/raw_assets_data.json` (or generates it via
   `generate_mock_data.py` if missing), runs `RiskEngine.process_all()` once, and starts
   a background sync loop.
2. **Sync tick** (every `SYNC_INTERVAL_SECONDS`, default 5s): drifts telemetry on 1–3
   random assets to stand in for a live sensor feed (small random walk, ~10% chance of a
   simulated surge), then reruns `RiskEngine.process_all()` on the full fleet.
3. **Audit trail**: only assets whose `risk_level` actually transitioned (e.g. Medium →
   High) get a new `AuditLogger.log_assessment()` entry — matches the "event-driven early
   warning" principle from the IoT architecture note, and keeps the audit log from being
   flooded by routine noise every tick.
4. **Broadcast**: pushes a JSON message to every connected WebSocket client whenever
   anything changed.

### Run it
```bash
pip install -r requirements.txt
uvicorn execution.api_server:app --reload --port 8787
```

**Preferred (Windows/local dev): `execution/start_api_server.ps1`.** Running uvicorn
directly inside an agent-tracked terminal (e.g. a Claude Code background shell) ties the
server's lifetime to that session — the process can get torn down between sessions, which
silently breaks the dashboard's live sync until someone notices the WebSocket error and
manually restarts it. The script instead launches uvicorn via `Start-Process`, so it's not
a child of the calling shell and keeps running independently of whatever started it. It's
idempotent (no-ops if port 8787 is already listening) and safe to run before every demo:
```powershell
powershell -ExecutionPolicy Bypass -File execution\start_api_server.ps1
```
Logs go to `.tmp/api_server.log` / `.tmp/api_server.err.log`.

### API Contract
- `GET /api/health` — liveness + connected client count.
- `GET /api/assets` — `{ generated_at, count, evaluations[] }`, each evaluation includes
  the raw asset record under `raw` (matches what the frontend modal/dossier expects).
- `GET /api/audit-log?limit=50` — most recent audit entries, newest first.
- `POST /api/refresh` — force an immediate sync tick + broadcast (useful for demos/tests).
- `POST /api/simulate-surge/{asset_id}` — force a surge on one asset on demand, so a demo
  doesn't have to wait for the random tick to pick that asset.
- `WS /ws/live` — on connect, sends `{ type: "snapshot", evaluations[] }`; on every tick
  with changes, sends `{ type: "update", evaluations[], changed[] }` where each `changed`
  entry carries `asset_id`, updated telemetry, `risk_level`, and `risk_level_changed`.

### Frontend integration (`app.js`)
- On page load, the client still renders instantly from the bundled `MOCK_ASSETS` array
  (so the static demo works standalone with no backend).
- `connectLiveSync()` opens the WebSocket and, once connected, replaces
  `currentEvaluations` with live server data on every snapshot/update, re-renders the
  hero metrics and priority queue, and drives the ticker bar from real changed-asset data.
- The `#wsStatusDot` / `#wsStatusLabel` elements in the ticker bar reflect actual
  connection state (green pulsing "Live" vs. gray "Reconnecting…").
- If the WebSocket drops, `startFakeTicker()` resumes the old locally-simulated ticker as
  a visual fallback, and the client retries the connection every 5s.

---

## 3. Edge Cases & Learnings
- Telemetry drift is clamped to `≤ 2.5×` baseline (pressure/temperature) and `≤ 30 mm/s`
  (vibration) so a long-running demo session doesn't drift into implausible values.
- The sync tick and its state mutation run with no `await` in between, so it's atomic
  within the single-threaded asyncio event loop — no lock was needed around
  `raw_assets` / `evaluations`.
- CORS is wide open (`allow_origins=["*"]`) since this is a local demo tool serving a
  static HTML file with no auth; tighten this before any real deployment.
- If you need a real sensor/IoT source instead of the simulated drift, replace
  `_drift_asset()` in `execution/api_server.py` with real ingestion and keep everything
  downstream (`RiskEngine`, `AuditLogger`, the WebSocket broadcast) unchanged — that's the
  intended seam for growing into the full architecture in
  `directives/iot_integration_architecture.md`.
