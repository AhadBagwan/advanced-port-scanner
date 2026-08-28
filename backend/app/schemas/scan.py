"""Scan Pydantic schemas"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator


class ScanResultSchema(BaseModel):
    """Scan result schema"""

    id: Optional[int] = None
    port: int
    is_open: bool
    service_name: Optional[str] = None
    service_version: Optional[str] = None
    response_time_ms: Optional[float] = None
    protocol: str = "TCP"
    risk_level: Optional[str] = "Info"
    vulnerability_description: Optional[str] = None
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True


class ScanCreate(BaseModel):
    """Scan creation request schema"""

    target: str = Field(..., description="Target hostname, IP, or CIDR range (e.g. 192.168.1.0/28)")
    port_range_start: int = Field(default=20, ge=1, le=65535)
    port_range_end: int = Field(default=1024, ge=1, le=65535)
    preset_profile: Optional[str] = Field(default="custom", description="web, database, remote_management, top100, custom")
    custom_ports: Optional[List[int]] = None
    scan_type: str = Field(default="standard")  # standard, stealth, aggressive
    timeout: float = Field(default=0.5, gt=0)
    max_workers: int = Field(default=200, ge=1, le=500)
    enable_service_detection: bool = True
    enable_banner_grabbing: bool = False
    tags: List[str] = []
    notes: Optional[str] = None


class ScanUpdate(BaseModel):
    """Scan update request schema"""

    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class ScanResponse(BaseModel):
    """Scan response schema"""

    id: int
    target_host: str
    target_ip: str
    status: str
    port_range_start: int
    port_range_end: int
    open_ports_count: int
    duration_seconds: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScanDetailResponse(ScanResponse):
    """Detailed scan response with results"""

    timeout_seconds: float
    workers_count: int
    scan_type: str
    enable_service_detection: bool
    enable_banner_grabbing: bool
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None
    results: List[ScanResultSchema] = []
    tags: List[str] = []

    @validator("tags", pre=True, always=True)
    def convert_tags(cls, v):
        if isinstance(v, list):
            return [t.tag if hasattr(t, "tag") else t for t in v]
        return v


class ScanProgressUpdate(BaseModel):
    """Scan progress update message"""

    event: str  # port_scanned, scan_started, scan_completed
    port: Optional[int] = None
    is_open: Optional[bool] = None
    service: Optional[str] = None
    progress_percent: Optional[int] = None
    status: Optional[str] = None


class ScanDiffPort(BaseModel):
    """Port entry in scan comparison"""

    port: int
    service_name: Optional[str] = None
    status_scan1: Optional[str] = None  # open, closed, missing
    status_scan2: Optional[str] = None  # open, closed, missing
    change_type: str  # added, removed, unchanged, modified


class ScanComparisonResponse(BaseModel):
    """Scan comparison response"""

    scan1: ScanResponse
    scan2: ScanResponse
    added_ports: List[int]
    removed_ports: List[int]
    common_ports: List[int]
    details: List[ScanDiffPort]
