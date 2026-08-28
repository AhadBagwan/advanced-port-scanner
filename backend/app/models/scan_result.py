"""Scan result model"""

from sqlalchemy import ForeignKey, Integer, String, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class ScanResult(Base):
    """Scan result model"""

    __tablename__ = "scan_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), nullable=False)
    port: Mapped[int] = mapped_column(Integer, nullable=False)
    is_open: Mapped[bool] = mapped_column(Boolean, nullable=False)
    service_name: Mapped[str] = mapped_column(String(255), nullable=True)
    service_version: Mapped[str] = mapped_column(String(255), nullable=True)
    banner_info: Mapped[str] = mapped_column(String(1000), nullable=True)
    response_time_ms: Mapped[float] = mapped_column(Float, nullable=True)
    protocol: Mapped[str] = mapped_column(
        String(10), default="TCP", nullable=False
    )  # TCP, UDP

    # Relationships
    scan = relationship("Scan", back_populates="results")

    def __repr__(self) -> str:
        return f"<ScanResult(port={self.port}, is_open={self.is_open}, service={self.service_name})>"
