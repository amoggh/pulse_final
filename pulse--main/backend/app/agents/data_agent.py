import pandas as pd
import os
from datetime import datetime

DATA_DIR = "app/data"

def load_csv(filename: str) -> pd.DataFrame:
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"{filename} not found in {DATA_DIR}")
    return pd.read_csv(path)

def load_admissions() -> pd.DataFrame:
    df = load_csv("admissions.csv")
    df['date'] = pd.to_datetime(df['date'])
    return df

def load_aqi_history() -> pd.DataFrame:
    df = load_csv("aqi_history.csv")
    df['date'] = pd.to_datetime(df['date'])
    return df

def load_bed_occupancy() -> pd.DataFrame:
    df = load_csv("bed_occupancy.csv")
    df['date'] = pd.to_datetime(df['date'])
    return df

def load_events_calendar() -> pd.DataFrame:
    df = load_csv("events_calendar.csv")
    df['date'] = pd.to_datetime(df['date'])
    return df

def load_inventory() -> pd.DataFrame:
    return load_csv("inventory.csv")

def load_staffing() -> pd.DataFrame:
    df = load_csv("staffing.csv")
    df['date'] = pd.to_datetime(df['date'])
    return df

def load_weather_history() -> pd.DataFrame:
    df = load_csv("weather_history.csv")
    df['date'] = pd.to_datetime(df['date'])
    return df

def build_feature_frame(city: str = "Mumbai") -> pd.DataFrame:
    # Load all time-series data
    adm = load_admissions()
    aqi = load_aqi_history()
    beds = load_bed_occupancy()
    events = load_events_calendar()
    weather = load_weather_history()

    # Filter by city if applicable (AQI has city column)
    aqi = aqi[aqi['city'] == city]

    # Merge on date
    # Start with admissions as base
    df = adm.merge(aqi[['date', 'aqi']], on='date', how='left')
    df = df.merge(beds[['date', 'occupied_beds', 'total_beds']], on='date', how='left')
    df = df.merge(weather[['date', 'temperature', 'humidity']], on='date', how='left')
    
    # Events might be sparse, so left join and fillna
    df = df.merge(events[['date', 'event_name', 'is_holiday']], on='date', how='left')
    df['is_holiday'] = df['is_holiday'].fillna(False)
    df['event_name'] = df['event_name'].fillna("None")

    df = df.sort_values('date').reset_index(drop=True)
    
    # Forward fill missing values for continuous data if any
    df['aqi'] = df['aqi'].ffill()
    df['occupied_beds'] = df['occupied_beds'].ffill()
    
    return df

def get_current_occupancy(city: str = "Mumbai") -> dict:
    """Get current bed occupancy from latest data"""
    beds = load_bed_occupancy()
    latest = beds.iloc[-1]
    
    occupied = int(latest['occupied_beds'])
    total = int(latest['total_beds'])
    percentage = round((occupied / total) * 100, 1) if total > 0 else 0
    
    return {
        "occupied_beds": occupied,
        "total_beds": total,
        "occupancy_percentage": percentage,
        "available_beds": total - occupied
    }

def get_current_aqi(city: str = "Mumbai") -> int:
    """Get latest AQI reading"""
    aqi = load_aqi_history()
    aqi = aqi[aqi['city'] == city]
    if len(aqi) > 0:
        return int(aqi.iloc[-1]['aqi'])
    return 100  # Default

def get_current_inventory() -> pd.DataFrame:
    """Get current inventory levels"""
    return load_inventory()

def get_current_staffing() -> dict:
    """Get current staffing levels"""
    staffing = load_staffing()
    latest = staffing.iloc[-1]
    
    return {
        "doctors_on_call": int(latest['doctors_on_call']),
        "nurses_on_shift": int(latest['nurses_on_shift']),
        "date": latest['date'].strftime("%Y-%m-%d")
    }

def get_departments() -> pd.DataFrame:
    """Get department information"""
    df = load_csv("departments.csv")
    return df
