"""
api_server.py
Layer 3 execution tool: FastAPI service that keeps RiskPulse risk assessments in sync
with live sensor telemetry and pushes updates to connected dashboards over WebSocket.

This wraps the existing deterministic tools (risk_engine.py, audit_trail.py,
generate_mock_data.py) — it adds no scoring logic of its own. On an interval it
drifts a few assets' telemetry (standing in for a real sensor feed), rescoring the
whole fleet, logs any risk-level transitions to the tamper-evident audit trail, and
broadcasts the change to every connected client.

Run:
    uvicorn execution.api_server:app --reload --port 8787

See directives/realtime_sync_automation.md for the full design and API contract.
"""

import asyncio
import json
import os
import random
import sys
from datetime import datetime, timezone
from typing import Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Allow flat sibling imports (generate_mock_data, risk_engine, audit_trail) whether this
# module is launched directly or imported as `execution.api_server` by uvicorn.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from generate_mock_data import generate_assets_dataset
from risk_engine import RiskEngine
from audit_trail import AuditLogger

load_dotenv()

DATA_FILE = os.getenv("RISKPULSE_DATA_FILE", ".tmp/raw_assets_data.json")
AUDIT_LOG_FILE = os.getenv("RISKPULSE_AUDIT_LOG", ".tmp/audit_log.jsonl")
SYNC_INTERVAL_SECONDS = float(os.getenv("SYNC_INTERVAL_SECONDS", "5"))

app = FastAPI(title="RiskPulse Live Sync API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = RiskEngine()
audit_logger = AuditLogger(log_path=AUDIT_LOG_FILE)

raw_assets: List[Dict] = []
evaluations: List[Dict] = []
risk_levels_by_id: Dict[str, str] = {}
connected_clients: List[WebSocket] = []
sync_task: Optional[asyncio.Task] = None


def _load_or_generate_assets() -> List[Dict]:
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return generate_assets_dataset(num_assets=25, output_file=DATA_FILE)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _recompute() -> List[Dict]:
    """Rescore every asset and attach its raw record for API/UI consumption."""
    global evaluations
    raw_by_id = {a["asset_id"]: a for a in raw_assets}
    results = engine.process_all(raw_assets)
    for item in results:
        item["raw"] = raw_by_id.get(item["asset_id"], {})
    evaluations = results
    return results


def _drift_asset(asset: Dict, force_surge: bool = False) -> bool:
    """Random-walks one asset's telemetry to stand in for a live sensor reading.
    Occasionally simulates a surge so the pipeline has something real to catch, or
    always does when `force_surge` is set (used by /api/simulate-surge).
    Values are clamped relative to baseline so a long-running demo stays plausible.
    """
    tel = asset.setdefault("sensor_telemetry", {})
    p_base = tel.get("baseline_pressure_psi", 100.0)
    t_base = tel.get("baseline_temperature_c", 80.0)

    surge = force_surge or random.random() < 0.1
    if surge:
        tel["pressure_psi"] = tel.get("pressure_psi", p_base) + p_base * random.uniform(0.18, 0.4)
        tel["temperature_c"] = tel.get("temperature_c", t_base) + t_base * random.uniform(0.15, 0.35)
        tel["vibration_mms"] = tel.get("vibration_mms", 1.0) + random.uniform(3.0, 6.0)
    else:
        tel["pressure_psi"] = tel.get("pressure_psi", p_base) + random.uniform(-p_base * 0.02, p_base * 0.03)
        tel["temperature_c"] = tel.get("temperature_c", t_base) + random.uniform(-t_base * 0.015, t_base * 0.025)
        tel["vibration_mms"] = tel.get("vibration_mms", 1.0) + random.uniform(-0.15, 0.2)

    tel["pressure_psi"] = round(max(0.0, min(tel["pressure_psi"], p_base * 2.5)), 2)
    tel["temperature_c"] = round(max(0.0, min(tel["temperature_c"], t_base * 2.5)), 2)
    tel["vibration_mms"] = round(max(0.0, min(tel["vibration_mms"], 30.0)), 2)

    asset.setdefault("metadata", {})["last_updated"] = _now_iso()
    return surge


async def _sync_tick(force_asset_id: Optional[str] = None) -> Dict:
    """One ingestion cycle: drift telemetry, rescore the fleet, log any risk-level
    transitions to the audit trail, and return a change summary for broadcast."""
    previous_levels = dict(risk_levels_by_id)

    if force_asset_id:
        target = next((a for a in raw_assets if a["asset_id"] == force_asset_id), None)
        touched_ids = [force_asset_id] if target else []
        if target:
            _drift_asset(target, force_surge=True)
    else:
        sample_size = min(len(raw_assets), random.randint(1, 3))
        touched = random.sample(raw_assets, sample_size) if raw_assets else []
        touched_ids = [a["asset_id"] for a in touched]
        for asset in touched:
            _drift_asset(asset)

    results = _recompute()

    changed = []
    for item in results:
        asset_id = item["asset_id"]
        before = previous_levels.get(asset_id)
        after = item["risk_level"]
        risk_levels_by_id[asset_id] = after
        if asset_id not in touched_ids:
            continue
        level_changed = before is not None and before != after
        tel = item["raw"].get("sensor_telemetry", {})
        changed.append({
            "asset_id": asset_id,
            "asset_type": item["asset_type"],
            "location": item["location"],
            "risk_score": item["risk_score"],
            "risk_level": after,
            "risk_level_changed": level_changed,
            "pressure_psi": tel.get("pressure_psi"),
            "temperature_c": tel.get("temperature_c"),
            "vibration_mms": tel.get("vibration_mms"),
        })
        if level_changed:
            audit_logger.log_assessment(item["raw"], item)

    return {
        "type": "update",
        "generated_at": _now_iso(),
        "evaluations": results,
        "changed": changed,
    }


async def _broadcast(message: Dict) -> None:
    if not connected_clients:
        return
    payload = json.dumps(message, default=str)
    dead = []
    for ws in connected_clients:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        if ws in connected_clients:
            connected_clients.remove(ws)


async def _sync_loop() -> None:
    while True:
        await asyncio.sleep(SYNC_INTERVAL_SECONDS)
        try:
            message = await _sync_tick()
            if message["changed"]:
                await _broadcast(message)
        except Exception as exc:
            print(f"[api_server] sync_loop error: {exc}")


@app.on_event("startup")
async def on_startup() -> None:
    global raw_assets, sync_task
    raw_assets = _load_or_generate_assets()
    results = _recompute()
    for item in results:
        risk_levels_by_id[item["asset_id"]] = item["risk_level"]
    sync_task = asyncio.create_task(_sync_loop())
    print(f"[api_server] Loaded {len(raw_assets)} assets. Live sync every {SYNC_INTERVAL_SECONDS}s.")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    if sync_task:
        sync_task.cancel()


@app.get("/api/health")
async def health():
    return {"status": "ok", "assets": len(raw_assets), "clients": len(connected_clients)}


@app.get("/api/assets")
async def get_assets():
    return {"generated_at": _now_iso(), "count": len(evaluations), "evaluations": evaluations}


@app.get("/api/audit-log")
async def get_audit_log(limit: int = 50):
    if not os.path.exists(AUDIT_LOG_FILE):
        return {"entries": []}
    with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
        lines = [line for line in f if line.strip()]
    entries = [json.loads(line) for line in lines[-limit:]]
    entries.reverse()
    return {"entries": entries}


@app.post("/api/refresh")
async def force_refresh():
    message = await _sync_tick()
    await _broadcast(message)
    return message


@app.post("/api/simulate-surge/{asset_id}")
async def simulate_surge(asset_id: str):
    message = await _sync_tick(force_asset_id=asset_id)
    await _broadcast(message)
    return message


@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    await websocket.send_text(json.dumps({
        "type": "snapshot",
        "generated_at": _now_iso(),
        "evaluations": evaluations,
    }, default=str))
    try:
        while True:
            # Dashboard doesn't need to send anything; this just detects disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
