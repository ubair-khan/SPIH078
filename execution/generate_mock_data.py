"""
generate_mock_data.py
Generates realistic, messy industrial asset maintenance records, failure histories,
inspection audit reports, and sensor telemetry.
"""

import json
import os
import random
from datetime import datetime, timedelta

def generate_assets_dataset(num_assets=25, output_file=".tmp/raw_assets_data.json"):
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    random.seed(42)

    categories = [
        ("Centrifugal Pump", "PUMP", 120.0, 75.0),    # (name, prefix, baseline_psi, baseline_temp_c)
        ("Distillation Column", "DIST", 450.0, 180.0),
        ("Gas Compressor", "COMP", 800.0, 95.0),
        ("Steam Boiler", "BOIL", 250.0, 210.0),
        ("Chemical Reactor", "REACT", 350.0, 130.0),
        ("Conveyor System", "CONV", 15.0, 45.0),
        ("Heat Exchanger", "HEX", 180.0, 115.0)
    ]
    
    locations = ["Plant 1 - Sector A", "Plant 1 - Sector B", "Plant 2 - Refining", "Plant 2 - Storage Bay", "Offshore Platform North"]
    severities = ["Minor", "Moderate", "Critical", "Catastrophic"]
    
    dataset = []
    
    for i in range(1, num_assets + 1):
        cat_name, prefix, base_psi, base_temp = random.choice(categories)
        asset_id = f"{prefix}-{i:03d}"
        location = random.choice(locations)
        
        # Inject realistic scenarios (some clean, some highly stressed, some overdue)
        scenario_dice = random.random()
        
        if scenario_dice < 0.25:
            # High-risk profile: overdue maintenance, high failures, hot/over-pressured readings
            days_since_maint = random.randint(180, 400)
            maint_status = "Overdue"
            failures_90d = random.randint(3, 7)
            last_incident_sev = random.choice(["Critical", "Moderate", "Catastrophic"])
            audit_score = random.randint(25, 58)  # out of 100
            unresolved_violations = random.randint(2, 5)
            
            # Anomalous sensor readings
            pressure = round(base_psi * random.uniform(1.25, 1.55), 2)
            temperature = round(base_temp * random.uniform(1.20, 1.45), 2)
            vibration = round(random.uniform(7.5, 14.2), 2)
        elif scenario_dice < 0.60:
            # Moderate-risk profile
            days_since_maint = random.randint(60, 150)
            maint_status = "Pending Inspection"
            failures_90d = random.randint(1, 2)
            last_incident_sev = random.choice(["Minor", "Moderate"])
            audit_score = random.randint(60, 79)
            unresolved_violations = random.randint(1, 2)
            
            # Slight sensor drift
            pressure = round(base_psi * random.uniform(1.05, 1.18), 2)
            temperature = round(base_temp * random.uniform(1.04, 1.15), 2)
            vibration = round(random.uniform(3.5, 6.5), 2)
        else:
            # Low-risk profile (healthy)
            days_since_maint = random.randint(5, 45)
            maint_status = "Completed / Up to Date"
            failures_90d = 0
            last_incident_sev = "None"
            audit_score = random.randint(85, 99)
            unresolved_violations = 0
            
            # Normal sensor readings
            pressure = round(base_psi * random.uniform(0.96, 1.03), 2)
            temperature = round(base_temp * random.uniform(0.97, 1.02), 2)
            vibration = round(random.uniform(1.0, 2.8), 2)
        
        # Add realistic noise/messiness (e.g. occasional missing fields)
        asset_record = {
            "asset_id": asset_id,
            "asset_type": cat_name,
            "location": location,
            "maintenance": {
                "days_since_last_maintenance": days_since_maint,
                "status": maint_status,
                "recommended_interval_days": 90
            },
            "failures": {
                "failures_last_90d": failures_90d,
                "last_incident_severity": last_incident_sev,
                "root_cause_tags": ["bearing_wear", "thermal_stress", "seal_leak"] if failures_90d > 0 else []
            },
            "safety_audit": {
                "audit_score": audit_score,
                "unresolved_violations": unresolved_violations,
                "last_audit_days_ago": random.randint(15, 200)
            },
            "sensor_telemetry": {
                "pressure_psi": pressure,
                "baseline_pressure_psi": base_psi,
                "temperature_c": temperature,
                "baseline_temperature_c": base_temp,
                "vibration_mms": vibration,
                "vibration_threshold_mms": 5.0
            },
            "metadata": {
                "last_updated": (datetime.now() - timedelta(minutes=random.randint(2, 60))).isoformat()
            }
        }
        dataset.append(asset_record)
        
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
        
    print(f"[OK] Generated {len(dataset)} mock industrial records -> {output_file}")
    return dataset

if __name__ == "__main__":
    generate_assets_dataset()
