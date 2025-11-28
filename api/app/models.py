from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from .db import Base


class Hospital(Base):
    __tablename__ = "hospitals"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=True)
    state: Mapped[str] = mapped_column(String, nullable=True)
    departments: Mapped[list["Department"]] = relationship("Department", back_populates="hospital")


class Department(Base):
    __tablename__ = "departments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="departments")


class PatientInflow(Base):
    __tablename__ = "patient_inflow"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime, index=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), index=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), index=True)
    count: Mapped[int] = mapped_column(Integer, nullable=False)


class ResourceSnapshot(Base):
    __tablename__ = "resource_snapshot"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime, index=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), index=True)
    beds_total: Mapped[int] = mapped_column(Integer, default=0)
    beds_occupied: Mapped[int] = mapped_column(Integer, default=0)
    icu_total: Mapped[int] = mapped_column(Integer, default=0)
    icu_occupied: Mapped[int] = mapped_column(Integer, default=0)
    staff_on_shift: Mapped[int] = mapped_column(Integer, default=0)
    supplies_json: Mapped[dict] = mapped_column(JSON, default=dict)


class ContextSignals(Base):
    __tablename__ = "context_signals"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime, index=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), index=True)
    aqi: Mapped[float] = mapped_column(Float, default=0)
    festival_flag: Mapped[int] = mapped_column(Integer, default=0)
    epidemic_tag: Mapped[str] = mapped_column(String, default="")
    weather_json: Mapped[dict] = mapped_column(JSON, default=dict)


class Forecast(Base):
    __tablename__ = "forecasts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), index=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), index=True)
    horizon_date: Mapped[datetime] = mapped_column(DateTime, index=True)
    inflow_pred: Mapped[float] = mapped_column(Float)
    inflow_ci_low: Mapped[float] = mapped_column(Float)
    inflow_ci_high: Mapped[float] = mapped_column(Float)
    model_version: Mapped[str] = mapped_column(String, default="mvp-0")


class Shortage(Base):
    __tablename__ = "shortages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), index=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), index=True)
    horizon_date: Mapped[datetime] = mapped_column(DateTime, index=True)
    beds_gap: Mapped[float] = mapped_column(Float, default=0)
    staff_gap: Mapped[float] = mapped_column(Float, default=0)
    supply_gaps_json: Mapped[dict] = mapped_column(JSON, default=dict)
    severity: Mapped[str] = mapped_column(String, default="LOW")


class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime, index=True, default=datetime.utcnow)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), index=True)
    severity: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(Text)
    action_json: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String, default="open")
    ack_by: Mapped[str | None] = mapped_column(String, nullable=True)
    ack_ts: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), index=True)
    role: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)


class Document(Base):
    __tablename__ = "documents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), index=True)
    title: Mapped[str] = mapped_column(String)
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[str] = mapped_column(Text)  # store as JSON string for MVP; swap to pgvector later


