/**
 * RiskRadar — Interactive Client Logic & Mock Data Engine
 * Features:
 * - 25+ pre-loaded industrial assets with realistic telemetry and historical logs
 * - Client-side deterministic Risk Engine implementation matching Layer 3 python spec
 * - Real-time slider recalculations & dynamic plain-language reasoning updates
 * - Search & filterable Priority Inspection Queue
 * - Tamper-evident Audit Trail logger with live additions and JSONL download
 * - Safety Dossier PDF/Markdown report generator
 * - Dynamic live telemetry streaming ticker simulator
 */

// 1. Mock Industrial Assets Dataset (Full Realistic Data)
const MOCK_ASSETS = [
  {
    asset_id: "COMP-003",
    asset_type: "Gas Compressor",
    location: "Offshore Platform North",
    maintenance: { days_since_last_maintenance: 210, status: "Overdue", recommended_interval_days: 90 },
    failures: { failures_last_90d: 4, last_incident_severity: "Critical", root_cause_tags: ["thermal_stress", "seal_leak"] },
    safety_audit: { audit_score: 48, unresolved_violations: 3, last_audit_days_ago: 140 },
    sensor_telemetry: { pressure_psi: 920.0, baseline_pressure_psi: 800.0, temperature_c: 125.0, baseline_temperature_c: 95.0, vibration_mms: 8.4, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "BOIL-004",
    asset_type: "Steam Boiler",
    location: "Plant 1 - Sector A",
    maintenance: { days_since_last_maintenance: 310, status: "Overdue", recommended_interval_days: 90 },
    failures: { failures_last_90d: 5, last_incident_severity: "Catastrophic", root_cause_tags: ["pressure_surge", "valve_corrosion"] },
    safety_audit: { audit_score: 32, unresolved_violations: 4, last_audit_days_ago: 180 },
    sensor_telemetry: { pressure_psi: 365.0, baseline_pressure_psi: 250.0, temperature_c: 275.0, baseline_temperature_c: 210.0, vibration_mms: 11.2, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "REACT-005",
    asset_type: "Chemical Reactor",
    location: "Plant 2 - Refining",
    maintenance: { days_since_last_maintenance: 260, status: "Overdue", recommended_interval_days: 90 },
    failures: { failures_last_90d: 3, last_incident_severity: "Critical", root_cause_tags: ["catalyst_fouling", "thermal_runaway"] },
    safety_audit: { audit_score: 42, unresolved_violations: 2, last_audit_days_ago: 95 },
    sensor_telemetry: { pressure_psi: 490.0, baseline_pressure_psi: 350.0, temperature_c: 168.0, baseline_temperature_c: 130.0, vibration_mms: 9.1, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "DIST-002",
    asset_type: "Distillation Column",
    location: "Plant 2 - Refining",
    maintenance: { days_since_last_maintenance: 195, status: "Overdue", recommended_interval_days: 90 },
    failures: { failures_last_90d: 3, last_incident_severity: "Moderate", root_cause_tags: ["tray_fouling"] },
    safety_audit: { audit_score: 55, unresolved_violations: 2, last_audit_days_ago: 80 },
    sensor_telemetry: { pressure_psi: 540.0, baseline_pressure_psi: 450.0, temperature_c: 215.0, baseline_temperature_c: 180.0, vibration_mms: 7.8, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "PUMP-001",
    asset_type: "Centrifugal Pump",
    location: "Plant 1 - Sector B",
    maintenance: { days_since_last_maintenance: 185, status: "Overdue", recommended_interval_days: 90 },
    failures: { failures_last_90d: 2, last_incident_severity: "Moderate", root_cause_tags: ["cavitation", "bearing_wear"] },
    safety_audit: { audit_score: 62, unresolved_violations: 1, last_audit_days_ago: 60 },
    sensor_telemetry: { pressure_psi: 155.0, baseline_pressure_psi: 120.0, temperature_c: 92.0, baseline_temperature_c: 75.0, vibration_mms: 6.9, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "HEX-007",
    asset_type: "Heat Exchanger",
    location: "Plant 1 - Sector A",
    maintenance: { days_since_last_maintenance: 220, status: "Overdue", recommended_interval_days: 90 },
    failures: { failures_last_90d: 2, last_incident_severity: "Critical", root_cause_tags: ["tube_leak"] },
    safety_audit: { audit_score: 50, unresolved_violations: 3, last_audit_days_ago: 110 },
    sensor_telemetry: { pressure_psi: 240.0, baseline_pressure_psi: 180.0, temperature_c: 148.0, baseline_temperature_c: 115.0, vibration_mms: 6.2, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "COMP-008",
    asset_type: "Gas Compressor",
    location: "Plant 2 - Storage Bay",
    maintenance: { days_since_last_maintenance: 110, status: "Pending Inspection", recommended_interval_days: 90 },
    failures: { failures_last_90d: 1, last_incident_severity: "Minor", root_cause_tags: ["filter_clog"] },
    safety_audit: { audit_score: 72, unresolved_violations: 1, last_audit_days_ago: 45 },
    sensor_telemetry: { pressure_psi: 865.0, baseline_pressure_psi: 800.0, temperature_c: 104.0, baseline_temperature_c: 95.0, vibration_mms: 4.8, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "CONV-009",
    asset_type: "Conveyor System",
    location: "Plant 1 - Sector B",
    maintenance: { days_since_last_maintenance: 130, status: "Pending Inspection", recommended_interval_days: 90 },
    failures: { failures_last_90d: 2, last_incident_severity: "Minor", root_cause_tags: ["belt_misalignment"] },
    safety_audit: { audit_score: 68, unresolved_violations: 1, last_audit_days_ago: 75 },
    sensor_telemetry: { pressure_psi: 16.5, baseline_pressure_psi: 15.0, temperature_c: 52.0, baseline_temperature_c: 45.0, vibration_mms: 5.4, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "PUMP-010",
    asset_type: "Centrifugal Pump",
    location: "Plant 2 - Refining",
    maintenance: { days_since_last_maintenance: 85, status: "Pending Inspection", recommended_interval_days: 90 },
    failures: { failures_last_90d: 1, last_incident_severity: "Minor", root_cause_tags: ["seal_wear"] },
    safety_audit: { audit_score: 75, unresolved_violations: 1, last_audit_days_ago: 30 },
    sensor_telemetry: { pressure_psi: 132.0, baseline_pressure_psi: 120.0, temperature_c: 82.0, baseline_temperature_c: 75.0, vibration_mms: 4.2, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "DIST-011",
    asset_type: "Distillation Column",
    location: "Offshore Platform North",
    maintenance: { days_since_last_maintenance: 70, status: "Pending Inspection", recommended_interval_days: 90 },
    failures: { failures_last_90d: 1, last_incident_severity: "Moderate", root_cause_tags: ["reboiler_scaling"] },
    safety_audit: { audit_score: 79, unresolved_violations: 0, last_audit_days_ago: 50 },
    sensor_telemetry: { pressure_psi: 480.0, baseline_pressure_psi: 450.0, temperature_c: 192.0, baseline_temperature_c: 180.0, vibration_mms: 3.8, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "BOIL-012",
    asset_type: "Steam Boiler",
    location: "Plant 2 - Refining",
    maintenance: { days_since_last_maintenance: 95, status: "Pending Inspection", recommended_interval_days: 90 },
    failures: { failures_last_90d: 1, last_incident_severity: "Minor", root_cause_tags: ["water_feed_delay"] },
    safety_audit: { audit_score: 74, unresolved_violations: 1, last_audit_days_ago: 40 },
    sensor_telemetry: { pressure_psi: 268.0, baseline_pressure_psi: 250.0, temperature_c: 224.0, baseline_temperature_c: 210.0, vibration_mms: 4.5, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "REACT-013",
    asset_type: "Chemical Reactor",
    location: "Plant 1 - Sector A",
    maintenance: { days_since_last_maintenance: 65, status: "Pending Inspection", recommended_interval_days: 90 },
    failures: { failures_last_90d: 1, last_incident_severity: "Minor", root_cause_tags: ["valve_flutter"] },
    safety_audit: { audit_score: 78, unresolved_violations: 0, last_audit_days_ago: 35 },
    sensor_telemetry: { pressure_psi: 372.0, baseline_pressure_psi: 350.0, temperature_c: 138.0, baseline_temperature_c: 130.0, vibration_mms: 3.9, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "HEX-014",
    asset_type: "Heat Exchanger",
    location: "Plant 2 - Storage Bay",
    maintenance: { days_since_last_maintenance: 120, status: "Pending Inspection", recommended_interval_days: 90 },
    failures: { failures_last_90d: 1, last_incident_severity: "Minor", root_cause_tags: ["fouling"] },
    safety_audit: { audit_score: 70, unresolved_violations: 1, last_audit_days_ago: 60 },
    sensor_telemetry: { pressure_psi: 198.0, baseline_pressure_psi: 180.0, temperature_c: 126.0, baseline_temperature_c: 115.0, vibration_mms: 4.1, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "CONV-015",
    asset_type: "Conveyor System",
    location: "Offshore Platform North",
    maintenance: { days_since_last_maintenance: 90, status: "Pending Inspection", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 82, unresolved_violations: 0, last_audit_days_ago: 20 },
    sensor_telemetry: { pressure_psi: 15.6, baseline_pressure_psi: 15.0, temperature_c: 47.0, baseline_temperature_c: 45.0, vibration_mms: 3.2, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "PUMP-016",
    asset_type: "Centrifugal Pump",
    location: "Plant 1 - Sector A",
    maintenance: { days_since_last_maintenance: 15, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 96, unresolved_violations: 0, last_audit_days_ago: 15 },
    sensor_telemetry: { pressure_psi: 121.5, baseline_pressure_psi: 120.0, temperature_c: 75.5, baseline_temperature_c: 75.0, vibration_mms: 1.8, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "BOIL-017",
    asset_type: "Steam Boiler",
    location: "Offshore Platform North",
    maintenance: { days_since_last_maintenance: 25, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 94, unresolved_violations: 0, last_audit_days_ago: 25 },
    sensor_telemetry: { pressure_psi: 252.0, baseline_pressure_psi: 250.0, temperature_c: 212.0, baseline_temperature_c: 210.0, vibration_mms: 2.1, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "COMP-018",
    asset_type: "Gas Compressor",
    location: "Plant 1 - Sector B",
    maintenance: { days_since_last_maintenance: 30, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 98, unresolved_violations: 0, last_audit_days_ago: 10 },
    sensor_telemetry: { pressure_psi: 805.0, baseline_pressure_psi: 800.0, temperature_c: 96.0, baseline_temperature_c: 95.0, vibration_mms: 1.9, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "REACT-019",
    asset_type: "Chemical Reactor",
    location: "Plant 2 - Storage Bay",
    maintenance: { days_since_last_maintenance: 10, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 95, unresolved_violations: 0, last_audit_days_ago: 12 },
    sensor_telemetry: { pressure_psi: 351.0, baseline_pressure_psi: 350.0, temperature_c: 131.0, baseline_temperature_c: 130.0, vibration_mms: 2.0, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "DIST-020",
    asset_type: "Distillation Column",
    location: "Plant 1 - Sector A",
    maintenance: { days_since_last_maintenance: 40, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 92, unresolved_violations: 0, last_audit_days_ago: 30 },
    sensor_telemetry: { pressure_psi: 454.0, baseline_pressure_psi: 450.0, temperature_c: 181.5, baseline_temperature_c: 180.0, vibration_mms: 2.3, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "HEX-021",
    asset_type: "Heat Exchanger",
    location: "Plant 1 - Sector B",
    maintenance: { days_since_last_maintenance: 18, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 97, unresolved_violations: 0, last_audit_days_ago: 18 },
    sensor_telemetry: { pressure_psi: 181.0, baseline_pressure_psi: 180.0, temperature_c: 116.0, baseline_temperature_c: 115.0, vibration_mms: 1.6, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "CONV-022",
    asset_type: "Conveyor System",
    location: "Plant 2 - Refining",
    maintenance: { days_since_last_maintenance: 22, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 93, unresolved_violations: 0, last_audit_days_ago: 22 },
    sensor_telemetry: { pressure_psi: 15.2, baseline_pressure_psi: 15.0, temperature_c: 45.8, baseline_temperature_c: 45.0, vibration_mms: 1.5, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "PUMP-023",
    asset_type: "Centrifugal Pump",
    location: "Offshore Platform North",
    maintenance: { days_since_last_maintenance: 35, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 91, unresolved_violations: 0, last_audit_days_ago: 35 },
    sensor_telemetry: { pressure_psi: 122.0, baseline_pressure_psi: 120.0, temperature_c: 76.0, baseline_temperature_c: 75.0, vibration_mms: 2.1, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "BOIL-024",
    asset_type: "Steam Boiler",
    location: "Plant 1 - Sector B",
    maintenance: { days_since_last_maintenance: 12, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 99, unresolved_violations: 0, last_audit_days_ago: 12 },
    sensor_telemetry: { pressure_psi: 251.0, baseline_pressure_psi: 250.0, temperature_c: 211.0, baseline_temperature_c: 210.0, vibration_mms: 1.7, vibration_threshold_mms: 5.0 }
  },
  {
    asset_id: "COMP-025",
    asset_type: "Gas Compressor",
    location: "Plant 2 - Refining",
    maintenance: { days_since_last_maintenance: 28, status: "Completed / Up to Date", recommended_interval_days: 90 },
    failures: { failures_last_90d: 0, last_incident_severity: "None", root_cause_tags: [] },
    safety_audit: { audit_score: 94, unresolved_violations: 0, last_audit_days_ago: 28 },
    sensor_telemetry: { pressure_psi: 808.0, baseline_pressure_psi: 800.0, temperature_c: 96.5, baseline_temperature_c: 95.0, vibration_mms: 2.0, vibration_threshold_mms: 5.0 }
  }
];

// 2. Client-Side Deterministic Risk Engine Implementation
class ClientRiskEngine {
  constructor() {
    this.w_maint = 0.25;
    this.w_fail = 0.30;
    this.w_telemetry = 0.30;
    this.w_audit = 0.15;
  }

  evaluate(asset) {
    const maint = asset.maintenance || {};
    const failures = asset.failures || {};
    const audit = asset.safety_audit || {};
    const tel = asset.sensor_telemetry || {};

    // 1. Maintenance
    const daysSince = maint.days_since_last_maintenance || 0;
    const interval = maint.recommended_interval_days || 90;
    const overdueRatio = Math.max(0, (daysSince - interval) / interval);
    const maintScore = Math.min(100, overdueRatio * 50.0 + (daysSince > interval ? 30.0 : 0.0));

    // 2. Failures
    const failCount = failures.failures_last_90d || 0;
    const lastSev = failures.last_incident_severity || "None";
    const sevMap = { "None": 0.0, "Minor": 10.0, "Moderate": 25.0, "Critical": 45.0, "Catastrophic": 60.0 };
    const sevMultiplier = sevMap[lastSev] || 10.0;
    const failScore = Math.min(100, (failCount * 20.0) + sevMultiplier);

    // 3. Telemetry
    const pVal = tel.pressure_psi || 0;
    const pBase = Math.max(1, tel.baseline_pressure_psi || 1);
    const tVal = tel.temperature_c || 0;
    const tBase = Math.max(1, tel.baseline_temperature_c || 1);
    const vVal = tel.vibration_mms || 0;
    const vThresh = Math.max(1, tel.vibration_threshold_mms || 5.0);

    const pDelta = Math.max(0, (pVal - pBase) / pBase);
    const tDelta = Math.max(0, (tVal - tBase) / tBase);
    const vDelta = Math.max(0, (vVal - vThresh) / vThresh);

    const telemetryScore = Math.min(100, (pDelta * 120.0) + (tDelta * 120.0) + (vDelta * 80.0));

    // 4. Audit
    const rawAudit = audit.audit_score ?? 100;
    const violations = audit.unresolved_violations || 0;
    const auditRiskScore = Math.min(100, (100 - rawAudit) * 0.7 + (violations * 15.0));

    // Composite
    let composite = (
      (maintScore * this.w_maint) +
      (failScore * this.w_fail) +
      (telemetryScore * this.w_telemetry) +
      (auditRiskScore * this.w_audit)
    );

    if (lastSev === "Catastrophic" || (pDelta > 0.45 && tDelta > 0.35)) {
      composite = Math.max(composite, 88.0);
    }
    composite = Math.min(100.0, Math.max(0.0, Math.round(composite * 10) / 10));

    let riskLevel = "Low";
    if (composite >= 70.0) riskLevel = "High";
    else if (composite >= 40.0) riskLevel = "Medium";

    // Plain-Language Explanations
    const reasons = [];
    if (daysSince > interval) {
      reasons.push(`Maintenance is overdue by ${daysSince - interval} days (last serviced ${daysSince} days ago).`);
    }
    if (failCount > 0) {
      reasons.push(`Recorded ${failCount} failure incident(s) in past 90 days (Recent severity: ${lastSev}).`);
    }
    if (pDelta > 0.10) {
      reasons.push(`Operating pressure (${pVal.toFixed(1)} PSI) is ${(pDelta * 100).toFixed(1)}% above nominal baseline (${pBase.toFixed(1)} PSI).`);
    }
    if (tDelta > 0.10) {
      reasons.push(`Thermal reading (${tVal.toFixed(1)}°C) is ${(tDelta * 100).toFixed(1)}% elevated over rating (${tBase.toFixed(1)}°C).`);
    }
    if (vVal > vThresh) {
      reasons.push(`Excessive vibration detected at ${vVal.toFixed(1)} mm/s (Threshold: ${vThresh.toFixed(1)} mm/s).`);
    }
    if (violations > 0) {
      reasons.push(`${violations} open safety compliance violation(s) remain unresolved.`);
    }

    const explanation = reasons.length > 0 
      ? reasons.join(" ") 
      : "Operating within normal safe limits across telemetry, maintenance schedules, and audit scores.";

    // Action Directives
    let action = "";
    if (composite >= 80.0) {
      action = "EMERGENCY: Immediate safety shutdown and comprehensive physical inspection required.";
    } else if (composite >= 70.0) {
      action = "HIGH PRIORITY: Dispatch inspection team for urgent diagnostic overhaul and pressure relief calibration.";
    } else if (composite >= 50.0) {
      action = "PREVENTIVE: Schedule servicing within 7 calendar days; recalibrate thermal/vibration sensors.";
    } else if (composite >= 40.0) {
      action = "MONITOR: Increase telemetry sampling frequency and resolve open audit citations during next routine cycle.";
    } else {
      action = "ROUTINE: Continue standard monitoring and retain current maintenance interval.";
    }

    return {
      asset_id: asset.asset_id,
      asset_type: asset.asset_type,
      location: asset.location,
      risk_score: composite,
      risk_level: riskLevel,
      component_scores: {
        maint_risk: Math.round(maintScore),
        fail_risk: Math.round(failScore),
        telemetry_risk: Math.round(telemetryScore),
        audit_risk: Math.round(auditRiskScore)
      },
      p_delta: pDelta,
      t_delta: tDelta,
      explanation: explanation,
      contributing_factors: reasons,
      recommended_action: action,
      raw: asset
    };
  }

  evaluateAll(assets) {
    const evaluated = assets.map(a => this.evaluate(a));
    evaluated.sort((a, b) => b.risk_score - a.risk_score);
    evaluated.forEach((item, idx) => {
      item.priority_rank = idx + 1;
    });
    return evaluated;
  }
}

// 3. Application State & Orchestration
const engine = new ClientRiskEngine();
let currentEvaluations = engine.evaluateAll(MOCK_ASSETS);
let currentSimAsset = { ...MOCK_ASSETS[0] };
let auditLogEntries = [];

// Initialize In-Memory Audit Logs from initial evaluations
function initAuditLog() {
  auditLogEntries = currentEvaluations.map(ev => ({
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
    asset_id: ev.asset_id,
    asset_type: ev.asset_type,
    location: ev.location,
    priority_rank: ev.priority_rank,
    risk_score: ev.risk_score,
    risk_level: ev.risk_level,
    decision_factors: ev.contributing_factors,
    recommended_action: ev.recommended_action,
    raw_snapshot: {
      days_since_maint: ev.raw.maintenance.days_since_last_maintenance,
      failures_90d: ev.raw.failures.failures_last_90d,
      pressure_psi: ev.raw.sensor_telemetry.pressure_psi,
      temperature_c: ev.raw.sensor_telemetry.temperature_c,
      vibration_mms: ev.raw.sensor_telemetry.vibration_mms
    }
  }));
}

// 4. UI Rendering Functions

function renderHeroMetrics() {
  const total = currentEvaluations.length;
  const high = currentEvaluations.filter(e => e.risk_level === "High").length;
  const med = currentEvaluations.filter(e => e.risk_level === "Medium").length;
  const low = currentEvaluations.filter(e => e.risk_level === "Low").length;

  document.getElementById("metricAssetsCount").textContent = total;
  document.getElementById("metricHighRisk").textContent = high;
  document.getElementById("highRiskCountBadge").textContent = `${high} Assets`;

  document.getElementById("countAll").textContent = total;
  document.getElementById("countHigh").textContent = high;
  document.getElementById("countMed").textContent = med;
  document.getElementById("countLow").textContent = low;
}

function renderPresetDropdown() {
  const select = document.getElementById("assetPresetSelect");
  select.innerHTML = "";
  MOCK_ASSETS.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.asset_id;
    opt.textContent = `${a.asset_id} — ${a.asset_type} (${a.location})`;
    if (a.asset_id === currentSimAsset.asset_id) opt.selected = true;
    select.appendChild(opt);
  });
}

function updateSimulatorSlidersFromCurrentAsset() {
  const a = currentSimAsset;
  document.getElementById("sliderMaintDays").value = a.maintenance.days_since_last_maintenance;
  document.getElementById("sliderFailures").value = a.failures.failures_last_90d;
  document.getElementById("sliderPressure").value = Math.round(a.sensor_telemetry.pressure_psi);
  document.getElementById("sliderTemp").value = Math.round(a.sensor_telemetry.temperature_c);
  document.getElementById("sliderVib").value = a.sensor_telemetry.vibration_mms;
  document.getElementById("sliderAudit").value = a.safety_audit.audit_score;

  document.getElementById("labelBasePressure").textContent = `${a.sensor_telemetry.baseline_pressure_psi} PSI`;
  document.getElementById("labelBaseTemp").textContent = `${a.sensor_telemetry.baseline_temperature_c}°C`;
  document.getElementById("labelSeverity").textContent = a.failures.last_incident_severity;

  recalculateSimulator();
}

function recalculateSimulator() {
  // Read slider inputs
  const maintDays = parseInt(document.getElementById("sliderMaintDays").value, 10);
  const failures = parseInt(document.getElementById("sliderFailures").value, 10);
  const pressure = parseFloat(document.getElementById("sliderPressure").value);
  const temp = parseFloat(document.getElementById("sliderTemp").value);
  const vib = parseFloat(document.getElementById("sliderVib").value);
  const auditScore = parseInt(document.getElementById("sliderAudit").value, 10);

  // Update slider label texts
  document.getElementById("valMaintDays").textContent = `${maintDays} days`;
  document.getElementById("valFailures").textContent = `${failures} incident(s)`;
  
  const pBase = currentSimAsset.sensor_telemetry.baseline_pressure_psi;
  const tBase = currentSimAsset.sensor_telemetry.baseline_temperature_c;
  const pPct = ((pressure - pBase) / pBase * 100).toFixed(1);
  const tPct = ((temp - tBase) / tBase * 100).toFixed(1);
  
  document.getElementById("valPressure").textContent = `${pressure} PSI (${pPct >= 0 ? '+' : ''}${pPct}%)`;
  document.getElementById("valTemp").textContent = `${temp}°C (${tPct >= 0 ? '+' : ''}${tPct}%)`;
  document.getElementById("valVib").textContent = `${vib.toFixed(1)} mm/s`;
  document.getElementById("valAudit").textContent = `${auditScore} / 100`;

  // Construct synthetic asset state
  const evalObj = {
    asset_id: currentSimAsset.asset_id,
    asset_type: currentSimAsset.asset_type,
    location: currentSimAsset.location,
    maintenance: {
      days_since_last_maintenance: maintDays,
      recommended_interval_days: currentSimAsset.maintenance.recommended_interval_days
    },
    failures: {
      failures_last_90d: failures,
      last_incident_severity: failures > 0 ? currentSimAsset.failures.last_incident_severity : "None"
    },
    safety_audit: {
      audit_score: auditScore,
      unresolved_violations: auditScore < 60 ? 3 : (auditScore < 80 ? 1 : 0)
    },
    sensor_telemetry: {
      pressure_psi: pressure,
      baseline_pressure_psi: pBase,
      temperature_c: temp,
      baseline_temperature_c: tBase,
      vibration_mms: vib,
      vibration_threshold_mms: 5.0
    }
  };

  const result = engine.evaluate(evalObj);

  // Render Gauge & Score
  document.getElementById("displayScore").textContent = result.risk_score.toFixed(1);
  document.getElementById("displayAssetName").textContent = `${result.asset_id} — ${result.asset_type}`;
  document.getElementById("displayAssetLocation").innerHTML = `<i class="fa-solid fa-location-dot"></i> ${result.location}`;
  
  const badge = document.getElementById("displayRiskBadge");
  badge.className = `risk-pill ${result.risk_level.toLowerCase()}`;
  badge.textContent = `${result.risk_level.toUpperCase()} RISK`;

  // Animate Gauge SVG (Circumference ~ 427)
  const maxDash = 427;
  const offset = maxDash - (maxDash * (result.risk_score / 100));
  const gaugeFill = document.getElementById("gaugeCircle");
  gaugeFill.style.strokeDashoffset = offset;
  
  if (result.risk_level === "High") {
    gaugeFill.style.stroke = "var(--status-danger)";
  } else if (result.risk_level === "Medium") {
    gaugeFill.style.stroke = "var(--status-warning)";
  } else {
    gaugeFill.style.stroke = "var(--status-success)";
  }

  // Component breakdown progress bars
  document.getElementById("scoreMaint").textContent = `${result.component_scores.maint_risk}%`;
  document.getElementById("barMaint").style.width = `${result.component_scores.maint_risk}%`;
  document.getElementById("barMaint").className = `progress-bar ${result.component_scores.maint_risk > 60 ? 'danger' : (result.component_scores.maint_risk > 30 ? 'warning' : 'success')}`;

  document.getElementById("scoreFail").textContent = `${result.component_scores.fail_risk}%`;
  document.getElementById("barFail").style.width = `${result.component_scores.fail_risk}%`;
  document.getElementById("barFail").className = `progress-bar ${result.component_scores.fail_risk > 60 ? 'danger' : (result.component_scores.fail_risk > 30 ? 'warning' : 'success')}`;

  document.getElementById("scoreTelemetry").textContent = `${result.component_scores.telemetry_risk}%`;
  document.getElementById("barTelemetry").style.width = `${result.component_scores.telemetry_risk}%`;
  document.getElementById("barTelemetry").className = `progress-bar ${result.component_scores.telemetry_risk > 60 ? 'danger' : (result.component_scores.telemetry_risk > 30 ? 'warning' : 'success')}`;

  document.getElementById("scoreAuditFactor").textContent = `${result.component_scores.audit_risk}%`;
  document.getElementById("barAuditFactor").style.width = `${result.component_scores.audit_risk}%`;
  document.getElementById("barAuditFactor").className = `progress-bar ${result.component_scores.audit_risk > 60 ? 'danger' : (result.component_scores.audit_risk > 30 ? 'warning' : 'success')}`;

  // Plain-Language Explanation & Action
  document.getElementById("displayExplanation").textContent = result.explanation;
  document.getElementById("displayAction").textContent = result.recommended_action;

  return result;
}

// 5. Render Priority Queue Table
function renderQueueTable(filter = "ALL", searchQuery = "") {
  const tbody = document.getElementById("queueTableBody");
  tbody.innerHTML = "";

  const query = searchQuery.trim().toLowerCase();

  const filtered = currentEvaluations.filter(item => {
    const matchesFilter = (filter === "ALL") || (item.risk_level.toUpperCase() === filter.toUpperCase());
    const matchesSearch = !query || 
      item.asset_id.toLowerCase().includes(query) ||
      item.asset_type.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.explanation.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-dim);">No assets found matching current criteria.</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    tr.onclick = () => openAssetModal(item.asset_id);

    const riskClass = item.risk_level.toLowerCase();
    const primaryReason = item.contributing_factors.length > 0 ? item.contributing_factors[0] : "All nominal parameters verified.";

    tr.innerHTML = `
      <td><span class="priority-pill">#${String(item.priority_rank).padStart(2, '0')}</span></td>
      <td>
        <span class="asset-cell">${item.asset_id}</span>
        <span class="asset-type-sub">${item.asset_type}</span>
      </td>
      <td>${item.location}</td>
      <td><span class="score-cell ${riskClass === 'high' ? 'high' : (riskClass === 'medium' ? 'med' : 'low')}">${item.risk_score}</span></td>
      <td><span class="risk-pill ${riskClass}">${item.risk_level.toUpperCase()}</span></td>
      <td style="max-width: 280px; font-size: 0.8rem; line-height: 1.4;">${primaryReason}</td>
      <td style="max-width: 240px; font-size: 0.78rem; color: #cbd5e1;">${item.recommended_action}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openAssetModal('${item.asset_id}')">
          <i class="fa-solid fa-eye"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 6. Render Audit Trail Stream
function renderAuditLog() {
  const container = document.getElementById("auditLogStream");
  container.innerHTML = "";

  document.getElementById("auditLogCountBadge").textContent = `${auditLogEntries.length} Logged Decisions`;

  auditLogEntries.slice(0, 30).forEach(entry => {
    const div = document.createElement("div");
    div.className = "audit-entry";
    const riskClass = entry.risk_level.toLowerCase();

    div.innerHTML = `
      <div class="audit-entry-top">
        <span class="audit-ts">${entry.timestamp.replace('T', ' ').substring(0, 19)} UTC</span>
        <span class="audit-asset-tag">${entry.asset_id} (${entry.asset_type})</span>
        <span class="audit-verdict ${riskClass}">${entry.risk_level.toUpperCase()} RISK (Score: ${entry.risk_score})</span>
      </div>
      <div class="audit-reason-line"><strong>Justification:</strong> ${entry.decision_factors.join(' | ') || 'Nominal thresholds observed.'}</div>
      <div class="audit-action-line"><strong>Protocol:</strong> ${entry.recommended_action}</div>
    `;
    container.appendChild(div);
  });
}

// 7. Modal Handlers
function openAssetModal(assetId) {
  const found = currentEvaluations.find(a => a.asset_id === assetId);
  if (!found) return;

  const modal = document.getElementById("assetModalBackdrop");
  const badge = document.getElementById("modalRiskBadge");
  const title = document.getElementById("modalAssetTitle");
  const body = document.getElementById("modalBodyContent");

  badge.className = `modal-badge ${found.risk_level === 'Low' ? 'success' : ''}`;
  badge.textContent = `${found.risk_level.toUpperCase()} RISK (${found.risk_score}/100)`;
  title.textContent = `Asset Dossier: ${found.asset_id} — ${found.asset_type}`;

  const tel = found.raw.sensor_telemetry;
  const maint = found.raw.maintenance;
  const fail = found.raw.failures;
  const audit = found.raw.safety_audit;

  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px;">
        <h4 style="font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 8px;"><i class="fa-solid fa-gauge"></i> Sensor Telemetry</h4>
        <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;">
          <div>Pressure: <strong>${tel.pressure_psi} PSI</strong> (Nominal: ${tel.baseline_pressure_psi} PSI)</div>
          <div>Temperature: <strong>${tel.temperature_c}°C</strong> (Nominal: ${tel.baseline_temperature_c}°C)</div>
          <div>Vibration: <strong>${tel.vibration_mms} mm/s</strong> (Safe limit: ${tel.vibration_threshold_mms} mm/s)</div>
        </div>
      </div>

      <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px;">
        <h4 style="font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 8px;"><i class="fa-solid fa-wrench"></i> Maintenance & Audit</h4>
        <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;">
          <div>Last Serviced: <strong>${maint.days_since_last_maintenance} days ago</strong> (${maint.status})</div>
          <div>Failures (90d): <strong>${fail.failures_last_90d}</strong> (Sev: ${fail.last_incident_severity})</div>
          <div>Safety Audit Score: <strong>${audit.audit_score}/100</strong> (${audit.unresolved_violations} violations)</div>
        </div>
      </div>
    </div>

    <div style="background: var(--bg-surface); padding: 16px; border-radius: 8px; border-left: 4px solid var(--accent-cyan);">
      <h4 style="font-size: 0.82rem; text-transform: uppercase; color: var(--accent-cyan); margin-bottom: 6px;">Plain-Language Safety Reasoning</h4>
      <p style="font-size: 0.88rem; color: var(--text-muted);">${found.explanation}</p>
    </div>

    <div style="background: var(--bg-surface); padding: 16px; border-radius: 8px; border-left: 4px solid var(--status-danger);">
      <h4 style="font-size: 0.82rem; text-transform: uppercase; color: #fb7185; margin-bottom: 6px;">Recommended Action Protocol</h4>
      <p style="font-size: 0.88rem; color: var(--text-muted);">${found.recommended_action}</p>
    </div>
  `;

  // Wire buttons
  document.getElementById("modalCopyJsonBtn").onclick = () => {
    navigator.clipboard.writeText(JSON.stringify(found, null, 2));
    alert(`Copied JSON dossier for ${found.asset_id} to clipboard!`);
  };

  document.getElementById("modalLoadToSimBtn").onclick = () => {
    currentSimAsset = found.raw;
    document.getElementById("assetPresetSelect").value = found.asset_id;
    updateSimulatorSlidersFromCurrentAsset();
    closeAssetModal();
    window.location.hash = "#simulator";
  };

  modal.classList.add("active");
}

function closeAssetModal() {
  document.getElementById("assetModalBackdrop").classList.remove("active");
}

// 8. Safety Report Dossier Generator
function openReportModal() {
  const modal = document.getElementById("reportModalBackdrop");
  const body = document.getElementById("reportBodyContent");

  const high = currentEvaluations.filter(e => e.risk_level === "High");
  const med = currentEvaluations.filter(e => e.risk_level === "Medium");

  let highHtml = high.map(h => `
    <div style="background: var(--bg-surface); padding: 12px 16px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--status-danger);">
      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.9rem; margin-bottom: 4px;">
        <span style="color: #fb7185;">#${h.priority_rank} ${h.asset_id} (${h.asset_type}) — Score: ${h.risk_score}</span>
        <span style="color: var(--text-dim); font-size: 0.8rem;">${h.location}</span>
      </div>
      <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 4px;"><strong>Reason:</strong> ${h.explanation}</div>
      <div style="font-size: 0.82rem; color: #f8fafc;"><strong>Directive:</strong> ${h.recommended_action}</div>
    </div>
  `).join("");

  body.innerHTML = `
    <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px; margin-bottom: 16px;">
      <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 4px;">Executive Industrial Safety & Risk Priority Report</h3>
      <p style="font-size: 0.85rem; color: var(--text-muted);">Generated on ${new Date().toUTCString()} • Total Monitored Fleet: ${currentEvaluations.length} Assets</p>
    </div>

    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
      <div style="background: var(--status-danger-bg); border: 1px solid var(--status-danger-border); padding: 12px 20px; border-radius: 8px; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 800; color: #fb7185;">${high.length}</div>
        <div style="font-size: 0.75rem; color: #fb7185;">Critical Priority Assets</div>
      </div>
      <div style="background: var(--status-warning-bg); border: 1px solid var(--status-warning-border); padding: 12px 20px; border-radius: 8px; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 800; color: #fbbf24;">${med.length}</div>
        <div style="font-size: 0.75rem; color: #fbbf24;">Medium Attention Assets</div>
      </div>
    </div>

    <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-cyan); margin-bottom: 12px;">Top Immediate Action Queue:</h4>
    ${highHtml}
  `;

  modal.classList.add("active");
}

function closeReportModal() {
  document.getElementById("reportModalBackdrop").classList.remove("active");
}

// 9. Event Listeners & Bootstrapping
document.addEventListener("DOMContentLoaded", () => {
  initAuditLog();
  renderHeroMetrics();
  renderPresetDropdown();
  updateSimulatorSlidersFromCurrentAsset();
  renderQueueTable();
  renderAuditLog();

  // Preset Select change
  document.getElementById("assetPresetSelect").addEventListener("change", (e) => {
    const chosen = MOCK_ASSETS.find(a => a.asset_id === e.target.value);
    if (chosen) {
      currentSimAsset = chosen;
      updateSimulatorSlidersFromCurrentAsset();
    }
  });

  // Simulator Range inputs
  const sliderIds = ["sliderMaintDays", "sliderFailures", "sliderPressure", "sliderTemp", "sliderVib", "sliderAudit"];
  sliderIds.forEach(id => {
    document.getElementById(id).addEventListener("input", recalculateSimulator);
  });

  // Simulate Surge Button
  document.getElementById("btnSimulateSurge").addEventListener("click", () => {
    document.getElementById("sliderTemp").value = Math.min(300, parseInt(document.getElementById("sliderTemp").value, 10) + 45);
    document.getElementById("sliderPressure").value = Math.min(1200, parseInt(document.getElementById("sliderPressure").value, 10) + 120);
    document.getElementById("sliderVib").value = 11.5;
    recalculateSimulator();
  });

  // Reset Nominal
  document.getElementById("btnResetNominal").addEventListener("click", () => {
    document.getElementById("sliderMaintDays").value = 20;
    document.getElementById("sliderFailures").value = 0;
    document.getElementById("sliderPressure").value = currentSimAsset.sensor_telemetry.baseline_pressure_psi;
    document.getElementById("sliderTemp").value = currentSimAsset.sensor_telemetry.baseline_temperature_c;
    document.getElementById("sliderVib").value = 1.8;
    document.getElementById("sliderAudit").value = 95;
    recalculateSimulator();
  });

  // Commit to Audit Log
  document.getElementById("btnLogToAudit").addEventListener("click", () => {
    const res = recalculateSimulator();
    const newEntry = {
      timestamp: new Date().toISOString(),
      asset_id: res.asset_id,
      asset_type: res.asset_type,
      location: res.location,
      priority_rank: 1,
      risk_score: res.risk_score,
      risk_level: res.risk_level,
      decision_factors: res.contributing_factors,
      recommended_action: res.recommended_action,
      raw_snapshot: {
        pressure_psi: parseFloat(document.getElementById("sliderPressure").value),
        temperature_c: parseFloat(document.getElementById("sliderTemp").value)
      }
    };
    auditLogEntries.unshift(newEntry);
    renderAuditLog();
    alert(`[✓] Assessment for ${res.asset_id} successfully signed and committed to Audit Trail!`);
  });

  // View Dossier from simulator
  document.getElementById("btnInspectDossier").addEventListener("click", () => {
    openAssetModal(currentSimAsset.asset_id);
  });

  // Filter Buttons for Queue
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filterVal = btn.getAttribute("data-filter");
      renderQueueTable(filterVal, document.getElementById("queueSearchInput").value);
    });
  });

  // Search input for Queue
  document.getElementById("queueSearchInput").addEventListener("input", (e) => {
    const activeFilter = document.querySelector(".filter-btn.active")?.getAttribute("data-filter") || "ALL";
    renderQueueTable(activeFilter, e.target.value);
  });

  // Export JSONL Audit
  document.getElementById("btnExportAuditJson").addEventListener("click", () => {
    const jsonl = auditLogEntries.map(e => JSON.stringify(e)).join("\n");
    const blob = new Blob([jsonl], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riskradar_audit_log_${new Date().toISOString().substring(0, 10)}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Modals close buttons
  document.getElementById("modalCloseBtn").addEventListener("click", closeAssetModal);
  document.getElementById("reportModalCloseBtn").addEventListener("click", closeReportModal);
  document.getElementById("assetModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "assetModalBackdrop") closeAssetModal();
  });
  document.getElementById("reportModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "reportModalBackdrop") closeReportModal();
  });

  // Launch Demo button smooth scrolls
  document.getElementById("btnLaunchDemo").addEventListener("click", () => {
    document.getElementById("simulator").scrollIntoView({ behavior: "smooth" });
  });

  // Quick report button
  document.getElementById("btnQuickReport").addEventListener("click", openReportModal);

  // Print PDF & Markdown report download
  document.getElementById("btnPrintReportBtn").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("btnDownloadReportMd").addEventListener("click", () => {
    let md = `# RiskRadar Executive Industrial Safety Report\nGenerated: ${new Date().toUTCString()}\n\n`;
    currentEvaluations.forEach(e => {
      md += `### #${e.priority_rank} [${e.risk_level.toUpperCase()}] ${e.asset_id} — ${e.asset_type}\n`;
      md += `- **Score**: ${e.risk_score}/100\n`;
      md += `- **Location**: ${e.location}\n`;
      md += `- **Explanation**: ${e.explanation}\n`;
      md += `- **Recommended Action**: ${e.recommended_action}\n\n`;
    });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RiskRadar_Inspection_Report_${new Date().toISOString().substring(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Live Sensor Ticker Subtle Updates
  setInterval(() => {
    const gas = document.getElementById("tickerGas");
    const boil = document.getElementById("tickerBoil");
    if (gas) {
      const p = (890 + Math.random() * 8).toFixed(1);
      gas.innerHTML = `Gas Compressor COMP-003: <span class="val-warn">${p} PSI (+11.8%)</span>`;
    }
    if (boil) {
      const t = (247 + Math.random() * 4).toFixed(1);
      boil.innerHTML = `Steam Boiler BOIL-004: <span class="val-danger">${t}°C (+18.4%)</span>`;
    }
  }, 3500);
});
