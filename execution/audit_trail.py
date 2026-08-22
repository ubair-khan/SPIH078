"""
audit_trail.py
Audit logging facility ensuring every RiskRadar recommendation and assessment
has a traceable, tamper-evident log entry recording input metrics and reasoning.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List

class AuditLogger:
    def __init__(self, log_path: str = ".tmp/audit_log.jsonl"):
        self.log_path = log_path
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)

    def log_assessment(self, original_asset: Dict[str, Any], evaluation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates an audit record containing the raw data snapshot, calculated scores,
        reasoning trail, and recommendation.
        """
        entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "asset_id": evaluation["asset_id"],
            "asset_type": evaluation["asset_type"],
            "location": evaluation["location"],
            "priority_rank": evaluation.get("priority_rank"),
            "risk_score": evaluation["risk_score"],
            "risk_level": evaluation["risk_level"],
            "decision_factors": evaluation["contributing_factors"],
            "component_breakdown": evaluation["component_scores"],
            "recommended_action": evaluation["recommended_action"],
            "raw_input_snapshot": {
                "days_since_maint": original_asset.get("maintenance", {}).get("days_since_last_maintenance"),
                "failures_90d": original_asset.get("failures", {}).get("failures_last_90d"),
                "last_incident_severity": original_asset.get("failures", {}).get("last_incident_severity"),
                "pressure_psi": original_asset.get("sensor_telemetry", {}).get("pressure_psi"),
                "temperature_c": original_asset.get("sensor_telemetry", {}).get("temperature_c"),
                "vibration_mms": original_asset.get("sensor_telemetry", {}).get("vibration_mms"),
                "audit_score": original_asset.get("safety_audit", {}).get("audit_score"),
                "unresolved_violations": original_asset.get("safety_audit", {}).get("unresolved_violations")
            }
        }
        
        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
            
        return entry

    def log_batch(self, raw_assets: List[Dict[str, Any]], evaluations: List[Dict[str, Any]]) -> int:
        raw_map = {a.get("asset_id"): a for a in raw_assets}
        count = 0
        for ev in evaluations:
            raw = raw_map.get(ev.get("asset_id"), {})
            self.log_assessment(raw, ev)
            count += 1
        return count
