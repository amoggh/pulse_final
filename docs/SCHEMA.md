# Schema (MVP)

- hospitals(id, name, city, state)
- departments(id, hospital_id, name)
- patient_inflow(id, ts, hospital_id, department_id, count)
- resource_snapshot(id, ts, hospital_id, beds_total, beds_occupied, icu_total, icu_occupied, staff_on_shift, supplies_json)
- context_signals(id, ts, hospital_id, aqi, festival_flag, epidemic_tag, weather_json)
- forecasts(id, hospital_id, department_id, horizon_date, inflow_pred, inflow_ci_low, inflow_ci_high, model_version)
- shortages(id, hospital_id, department_id, horizon_date, beds_gap, staff_gap, supply_gaps_json, severity)
- alerts(id, ts, hospital_id, severity, title, message, action_json, ack_by, ack_ts, status)
- users(id, hospital_id, role, email, password_hash)
- documents(id, hospital_id, title, content, embedding)

Indexes: time-series on ts columns, composite (hospital_id, department_id, ts)


