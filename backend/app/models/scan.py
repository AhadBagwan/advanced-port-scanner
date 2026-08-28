"""Scan model"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Scan(Base):
    """Scan model"""

    __tablename__ = "scans"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    target_host: Mapped[str] = mapped_column(String(255), nullable=False)
    target_ip: Mapped[str] = mapped_column(String(45), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False
    )  # pending, running, completed, failed
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_seconds: Mapped[float] = mapped_column(nullable=True)
    port_range_start: Mapped[int] = mapped_column(Integer, nullable=False)
    port_range_end: Mapped[int] = mapped_column(Integer, nullable=False)
    timeout_seconds: Mapped[float] = mapped_column(nullable=False)
    workers_count: Mapped[int] = mapped_column(Integer, nullable=False)
    scan_type: Mapped[str] = mapped_column(
        String(50), default="standard", nullable=False
    )  # standard, stealth, aggressive
    enable_service_detection: Mapped[bool] = mapped_column(default=True)
    enable_banner_grabbing: Mapped[bool] = mapped_column(default=False)
    open_ports_count: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="scans")
    results = relationship("ScanResult", back_populates="scan", cascade="all, delete-orphan")
    tags = relationship("ScanTag", back_populates="scan", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Scan(id={self.id}, target_ip={self.target_ip}, status={self.status})>"
