from sqlalchemy.orm import Session
from datetime import datetime
from . import models


def compute_shortage(predicted_inflow: float, available_beds: int, staff_on_shift: int) -> tuple[float, float, dict, str]:
    avg_length_of_stay_factor = 0.4
    required_staff_per_patient = 0.2

    beds_gap = predicted_inflow * avg_length_of_stay_factor - available_beds
    staff_gap = predicted_inflow * required_staff_per_patient - staff_on_shift
    supply_gaps = {}

    capacity = max(1.0, available_beds)
    ratio = max(beds_gap, staff_gap) / capacity
    severity = "LOW"
    if ratio > 0.3:
        severity = "HIGH"
    elif ratio > 0.15:
        severity = "MEDIUM"

    return beds_gap, staff_gap, supply_gaps, severity


