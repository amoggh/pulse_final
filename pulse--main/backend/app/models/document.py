from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), index=True)
    title = Column(String)
    content = Column(Text)
    embedding = Column(Text)  # store as JSON string for MVP; swap to pgvector later
