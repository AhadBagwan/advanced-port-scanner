"""Scan tag model"""

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class ScanTag(Base):
    """Scan tag model for organization"""

    __tablename__ = "scan_tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), nullable=False)
    tag: Mapped[str] = mapped_column(String(100), nullable=False)

    # Relationships
    scan = relationship("Scan", back_populates="tags")

    def __repr__(self) -> str:
        return f"<ScanTag(tag={self.tag})>"
