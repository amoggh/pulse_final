# PULSE API (MVP)

- POST `/auth/login` (form: username, password) -> { access_token }
- GET `/dashboard/{hospital_id}` -> { forecasts, alerts, load }
- GET `/forecast/{hospital_id}` -> [ForecastOut]
- GET `/alerts` -> [AlertOut]
- POST `/alerts` -> AlertOut
- PATCH `/alerts/{id}` -> AlertOut
- POST `/documents` -> DocumentOut
- GET `/documents/search?hospital_id=&query=` -> [{ id, title, snippet }]
- GET `/context/signals/latest?hospital_id=` -> latest signals
- POST `/seed` -> { status: "ok" }


