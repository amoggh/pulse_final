import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

os.makedirs('backend/app/data', exist_ok=True)

# Dates
start_date = datetime(2024, 1, 1)
end_date = datetime(2025, 12, 31)
date_range = pd.date_range(start=start_date, end=end_date)
n_days = len(date_range)

# 1. Admissions
df_admissions = pd.DataFrame({
    'date': date_range,
    'admissions_count': np.random.poisson(lam=50, size=n_days),
    'respiratory_cases': np.random.poisson(lam=10, size=n_days),
    'trauma_cases': np.random.poisson(lam=5, size=n_days)
})
df_admissions.to_csv('backend/app/data/admissions.csv', index=False)

# 2. AQI History
df_aqi = pd.DataFrame({
    'date': date_range,
    'city': 'Mumbai',
    'aqi': np.random.randint(50, 350, size=n_days)
})
df_aqi.to_csv('backend/app/data/aqi_history.csv', index=False)

# 3. Bed Occupancy
df_beds = pd.DataFrame({
    'date': date_range,
    'total_beds': 500,
    'occupied_beds': np.random.randint(300, 480, size=n_days)
})
df_beds.to_csv('backend/app/data/bed_occupancy.csv', index=False)

# 4. Departments
df_depts = pd.DataFrame({
    'dept_id': [1, 2, 3, 4],
    'name': ['Emergency', 'ICU', 'General Ward', 'Pediatrics'],
    'capacity': [50, 40, 300, 110]
})
df_depts.to_csv('backend/app/data/departments.csv', index=False)

# 5. Events Calendar
events = []
for year in [2024, 2025]:
    events.append({'date': f'{year}-11-01', 'event_name': 'Diwali', 'is_holiday': True})
    events.append({'date': f'{year}-12-25', 'event_name': 'Christmas', 'is_holiday': True})
    events.append({'date': f'{year}-08-15', 'event_name': 'Independence Day', 'is_holiday': True})
df_events = pd.DataFrame(events)
df_events.to_csv('backend/app/data/events_calendar.csv', index=False)

# 6. Inventory
df_inv = pd.DataFrame({
    'item_id': ['O2_CYL', 'NEB', 'PPE_KIT', 'TRAUMA_KIT'],
    'item_name': ['Oxygen Cylinder', 'Nebulizer', 'PPE Kit', 'Trauma Kit'],
    'current_stock': [100, 50, 500, 30],
    'min_threshold': [20, 10, 100, 5]
})
df_inv.to_csv('backend/app/data/inventory.csv', index=False)

# 7. Staffing
df_staff = pd.DataFrame({
    'date': date_range,
    'doctors_on_call': np.random.randint(10, 20, size=n_days),
    'nurses_on_shift': np.random.randint(30, 50, size=n_days)
})
df_staff.to_csv('backend/app/data/staffing.csv', index=False)

# 8. Weather History
df_weather = pd.DataFrame({
    'date': date_range,
    'temperature': np.random.uniform(20, 35, size=n_days),
    'humidity': np.random.uniform(40, 90, size=n_days),
    'precipitation': np.random.choice([0, 10, 50], p=[0.7, 0.2, 0.1], size=n_days)
})
df_weather.to_csv('backend/app/data/weather_history.csv', index=False)
