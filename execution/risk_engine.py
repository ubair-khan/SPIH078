"""
risk_engine.py
Core deterministic calculation and explainability engine for RiskPulse.
Evaluates historical maintenance, failure logs, safety audits, and sensor metrics
to compute risk score, category, plain-language explanations, and recommended actions.
"""

import math
from typing import Dict, Any, List

class RiskEngine:
    def __init__(self):
        # Weights totaling 1.0
        self.w_maintenance = 0.25
        self.w_failures = 0.30
        self.w_telemetry = 0.30
        self.w_audit = 0.15

    @staticmethod
    def _number(value: Any, default: float) -> float:
        try:
            number = float(value)
        except (TypeError, ValueError):
            return default
        return number if math.isfinite(number) else default

    def evaluate_asset(self, asset: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a single asset record and returns comprehensive risk assessment details.
        """
        asset_id = asset.get("asset_id", "UNKNOWN")
        asset_type = asset.get("asset_type", "Generic Industrial Asset")
        location = asset.get("location", "Plant Area")
        
        maint = asset.get("maintenance", {})
        failures = asset.get("failures", {})
        audit = asset.get("safety_audit", {})
        telemetry = asset.get("sensor_telemetry", {})
        
        # 1. Maintenance Component Score (0 - 100)
        days_since_m = max(0.0, self._number(maint.get("days_since_last_maintenance"), 0.0))
        interval = max(1.0, self._number(maint.get("recommended_interval_days"), 90.0))
        overdue_ratio = max(0.0, (days_since_m - interval) / interval)
        maint_score = min(100.0, overdue_ratio * 50.0 + (30.0 if days_since_m > interval else 0.0))
        
        # 2. Failures Component Score (0 - 100)
        fail_count_90d = max(0.0, self._number(failures.get("failures_last_90d"), 0.0))
        last_sev = str(failures.get("last_incident_severity") or "None").strip().title()
        sev_multiplier = {"None": 0.0, "Minor": 10.0, "Moderate": 25.0, "Critical": 45.0, "Catastrophic": 60.0}.get(last_sev, 10.0)
        fail_score = min(100.0, (fail_count_90d * 20.0) + sev_multiplier)
        
        # 3. Telemetry Anomaly Score (0 - 100)
        telemetry_values = [
            telemetry.get("pressure_psi"), telemetry.get("baseline_pressure_psi"),
            telemetry.get("temperature_c"), telemetry.get("baseline_temperature_c"),
            telemetry.get("vibration_mms"), telemetry.get("vibration_threshold_mms")
        ]
        telemetry_available = all(value is not None for value in telemetry_values)
        p_val = self._number(telemetry.get("pressure_psi"), 0.0)
        p_base = max(1.0, self._number(telemetry.get("baseline_pressure_psi"), 1.0))
        t_val = self._number(telemetry.get("temperature_c"), 0.0)
        t_base = max(1.0, self._number(telemetry.get("baseline_temperature_c"), 1.0))
        vib_val = self._number(telemetry.get("vibration_mms"), 0.0)
        vib_thresh = max(1.0, self._number(telemetry.get("vibration_threshold_mms"), 5.0))
        
        p_delta = max(0.0, (p_val - p_base) / p_base)
        t_delta = max(0.0, (t_val - t_base) / t_base)
        vib_delta = max(0.0, (vib_val - vib_thresh) / vib_thresh)
        
        telemetry_score = min(100.0, (p_delta * 120.0) + (t_delta * 120.0) + (vib_delta * 80.0))
        
        # 4. Safety Audit Component Score (0 - 100)
        raw_audit_score = min(100.0, max(0.0, self._number(audit.get("audit_score"), 100.0)))
        violations = max(0.0, self._number(audit.get("unresolved_violations"), 0.0))
        audit_risk_score = min(100.0, (100.0 - raw_audit_score) * 0.7 + (violations * 15.0))
        
        # Composite Weighted Score
        weights = {
            "maintenance": self.w_maintenance,
            "failures": self.w_failures,
            "telemetry": self.w_telemetry if telemetry_available else 0.0,
            "audit": self.w_audit,
        }
        weight_total = sum(weights.values())
        composite_score = (
            (maint_score * weights["maintenance"]) +
            (fail_score * weights["failures"]) +
            (telemetry_score * weights["telemetry"]) +
            (audit_risk_score * weights["audit"])
        ) / weight_total
        
        # Catastrophic Overrides (Fail-safe rule)
        if last_sev == "Catastrophic" or (p_delta > 0.45 and t_delta > 0.35):
            composite_score = max(composite_score, 88.0)
            
        composite_score = round(min(100.0, max(0.0, composite_score)), 1)
        
        # Categorize
        if composite_score >= 70.0:
            risk_level = "High"
        elif composite_score >= 40.0:
            risk_level = "Medium"
        else:
            risk_level = "Low"
            
        # Generate Plain-Language Explanations & Contributing Factors
        reasons = []
        if days_since_m > interval:
            reasons.append(f"Maintenance is overdue by {days_since_m - interval:g} days (last serviced {days_since_m:g} days ago).")
        if fail_count_90d > 0:
            reasons.append(f"Recorded {fail_count_90d:g} failure incidents in the last 90 days (Recent severity: {last_sev}).")
        if p_delta > 0.15:
            reasons.append(f"Operating pressure ({p_val:.1f} PSI) is {p_delta * 100:.1f}% above standard baseline ({p_base:.1f} PSI).")
        if t_delta > 0.12:
            reasons.append(f"Thermal reading ({t_val:.1f}°C) is {t_delta * 100:.1f}% elevated over nominal rating ({t_base:.1f}°C).")
        if vib_val > vib_thresh:
            reasons.append(f"Excessive mechanical vibration detected at {vib_val:.1f} mm/s (Safety threshold: {vib_thresh:.1f} mm/s).")
        if violations > 0:
            reasons.append(f"{violations:g} open compliance safety citations remain unresolved.")

        if not telemetry_available:
            reasons.append("Telemetry is incomplete; the score was reweighted toward maintenance, failures, and audit data.")
            
        if not reasons:
            explanation = "Asset operating within nominal safety thresholds across telemetry, audits, and maintenance schedules."
        else:
            explanation = " | ".join(reasons)
            
        # Formulate Recommended Action
        if composite_score >= 80.0:
            action = "EMERGENCY: Immediate safety shutdown and comprehensive physical inspection required."
        elif composite_score >= 70.0:
            action = "HIGH PRIORITY: Dispatch inspection team for urgent diagnostic overhaul and pressure relief calibration."
        elif composite_score >= 50.0:
            action = "PREVENTIVE: Schedule preventative servicing within 7 calendar days; recalibrate thermal/vibration sensors."
        elif composite_score >= 40.0:
            action = "MONITOR: Increase telemetry sampling frequency and resolve open audit citations during next routine cycle."
        else:
            action = "ROUTINE: Continue standard monitoring and retain current maintenance interval."

        return {
            "asset_id": asset_id,
            "asset_type": asset_type,
            "location": location,
            "risk_score": composite_score,
            "risk_level": risk_level,
            "component_scores": {
                "maintenance_risk": round(maint_score, 1),
                "failure_risk": round(fail_score, 1),
                "telemetry_risk": round(telemetry_score, 1),
                "audit_risk": round(audit_risk_score, 1)
            },
            "explanation": explanation,
            "contributing_factors": reasons,
            "recommended_action": action
        }

    def process_all(self, assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Evaluates and ranks all assets by risk severity.
        """
        results = [self.evaluate_asset(a) for a in assets]
        # Rank descending by score
        results.sort(key=lambda x: x["risk_score"], reverse=True)
        
        # Assign inspection priority rank
        for idx, item in enumerate(results, 1):
            item["priority_rank"] = idx
            
        return results
