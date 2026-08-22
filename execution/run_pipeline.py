"""
run_pipeline.py
Main orchestration runner for RiskPulse.
Ingests asset data -> Scores & ranks risks -> Generates plain-language reasons & recommendations
-> Emits audit log -> Saves results to .tmp/ and prints formatted executive summary.
"""

import json
import os
import sys
from datetime import datetime

from generate_mock_data import generate_assets_dataset
from risk_engine import RiskEngine
from audit_trail import AuditLogger

def run_riskpulse_pipeline(data_file: str = ".tmp/raw_assets_data.json", results_file: str = ".tmp/risk_assessment_results.json"):
    print("=" * 70)
    print("  RISKPULSE: Industrial Safety Risk Prediction & Audit System")
    print("=" * 70)
    
    # 1. Ensure Data Ingestion
    if not os.path.exists(data_file):
        print(f"[*] Raw data not found at {data_file}. Generating synthetic asset dataset...")
        raw_assets = generate_assets_dataset(num_assets=25, output_file=data_file)
    else:
        print(f"[*] Loading industrial asset records from {data_file}...")
        with open(data_file, "r", encoding="utf-8") as f:
            raw_assets = json.load(f)
            
    print(f"[*] Successfully loaded {len(raw_assets)} industrial assets.")
    
    # 2. Risk Engine Evaluation & Ranking
    print("[*] Evaluating risk models, telemetry anomalies, and maintenance history...")
    engine = RiskEngine()
    evaluations = engine.process_all(raw_assets)
    
    # 3. Write Audit Trail
    print("[*] Recording compliance audit trail to .tmp/audit_log.jsonl...")
    audit_logger = AuditLogger()
    audit_count = audit_logger.log_batch(raw_assets, evaluations)
    print(f"[*] Logged {audit_count} entries to audit log.")
    
    # 4. Save Final Results
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(evaluations, f, indent=2)
    print(f"[OK] Full assessment results saved to {results_file}\n")
    
    # 5. Output Ranked Executive Summary
    high_count = sum(1 for e in evaluations if e["risk_level"] == "High")
    med_count = sum(1 for e in evaluations if e["risk_level"] == "Medium")
    low_count = sum(1 for e in evaluations if e["risk_level"] == "Low")
    
    print("-" * 70)
    print(f"SAFETY SUMMARY: {len(evaluations)} Total Assets | 🔴 High: {high_count} | 🟡 Medium: {med_count} | 🟢 Low: {low_count}")
    print("-" * 70)
    print("TOP PRIORITY INSPECTION QUEUE (High & Critical Risks):")
    print("-" * 70)
    
    for item in evaluations:
        if item["risk_level"] in ("High", "Medium") and item["priority_rank"] <= 8:
            indicator = "🔴 [HIGH]" if item["risk_level"] == "High" else "🟡 [MED] "
            print(f"#{item['priority_rank']:02d} {indicator} Asset: {item['asset_id']} ({item['asset_type']}) - Score: {item['risk_score']}/100")
            print(f"    Location: {item['location']}")
            print(f"    Why Flagged: {item['explanation']}")
            print(f"    Action Plan: {item['recommended_action']}")
            print("-" * 70)

    print("\n[✓] Pipeline execution finished successfully.")
    return evaluations

if __name__ == "__main__":
    run_riskpulse_pipeline()
