import requests
import json

def test_endpoints():
    print("Testing Forecast Endpoint...")
    try:
        resp = requests.post("http://localhost:8000/api/forecast", json={
            "horizon_days": 7,
            "aqi_override": 250,
            "is_festival": False
        })
        data = resp.json()
        print(f"Forecast Explanation: {data.get('summary', {}).get('explanation')}")
    except Exception as e:
        print(f"Forecast Error: {e}")

    print("\nTesting Decision Endpoint...")
    try:
        resp = requests.get("http://localhost:8000/api/decision/evaluate")
        data = resp.json()
        print(f"Risk Explanation: {data.get('score_explanation')}")
        print(f"Projected Occupancy: {data.get('metrics', {}).get('projected_occupancy_pct')}%")
    except Exception as e:
        print(f"Decision Error: {e}")

if __name__ == "__main__":
    test_endpoints()
