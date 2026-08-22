# Architecture Design Note: Live IoT Sensor Data Integration

> **Status**: production-scale target. For what's actually implemented and running
> today, see [directives/realtime_sync_automation.md](realtime_sync_automation.md)
> (`execution/api_server.py`) — a lightweight FastAPI + WebSocket sync loop with no
> extra infrastructure. Grow into this document's Kafka/MQTT/Flink design only once
> real high-throughput sensor ingestion is actually needed.

## 1. Overview
This design note outlines how the RiskPulse scoring and explanation engine plugs into live industrial IoT sensor streams (MQTT, OPC-UA, Kafka, AWS IoT Core) for sub-second anomaly detection and continuous safety re-scoring.

---

## 2. Streaming Ingestion Pipeline
```
[ Industrial Sensors (OPC-UA / Modbus / MQTT) ]
                     │
                     ▼
          [ Edge Gateway / Broker ]
          (Edge filtering & timestamping)
                     │
                     ▼
       [ Event Stream (Kafka / Kinesis) ]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
 [ Stream Worker (Flink) ] [ Cold Storage / Data Lake ]
   - Windowed aggregation     - Long term audit history
   - Drift detection          - Model retraining
         │
         ▼
[ Risk Engine Scoring API ]
   - Dynamic threshold checks
   - Rolling Z-score calculation
         │
         ▼
[ Alert Broker (WebSockets / PagerDuty / Webhooks) ]
   - Immediate high-risk dispatch to floor inspectors
```

---

## 3. Real-Time Scoring Enhancements
1. **Sliding Windows**: Compute rolling 5-minute and 1-hour exponential moving averages (EMA) for temperature and pressure to detect rapid trends before hard limits are breached.
2. **Dynamic Baseline Drift**: Update baselines dynamically to account for ambient temperature shifts while identifying asset-specific thermal runaways.
3. **Event-Driven Early Warning Alerts**: Trigger stateful alerts when risk rating transitions from Low -> Medium or Medium -> High.
