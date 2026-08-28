"""Scan service"""

from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from app.core.scanner import get_scanner
from app.core.service_detector import get_detector
from app.models import Scan, ScanResult, ScanTag, User
from app.utils.exceptions import NotFoundError


class ScanService:
    """Scan business logic"""

    @staticmethod
    def create_scan(
        db: Session,
        user: User,
        target: str,
        port_range_start: int,
        port_range_end: int,
        scan_type: str,
        timeout: float,
        max_workers: int,
        enable_service_detection: bool,
        enable_banner_grabbing: bool,
        tags: List[str],
        notes: Optional[str],
    ) -> Scan:
        """Create new scan"""
        scan = Scan(
            user_id=user.id,
            target_host=target,
            target_ip=target,  # Will be resolved
            status="pending",
            port_range_start=port_range_start,
            port_range_end=port_range_end,
            scan_type=scan_type,
            timeout_seconds=timeout,
            workers_count=max_workers,
            enable_service_detection=enable_service_detection,
            enable_banner_grabbing=enable_banner_grabbing,
            notes=notes,
        )

        db.add(scan)
        db.commit()

        # Add tags
        for tag in tags:
            scan_tag = ScanTag(scan_id=scan.id, tag=tag)
            db.add(scan_tag)
        db.commit()
        db.refresh(scan)

        return scan

    @staticmethod
    def get_scan(db: Session, scan_id: int, user: User) -> Scan:
        """Get scan by ID"""
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            raise NotFoundError("Scan", str(scan_id))

        # Check if user owns this scan
        if scan.user_id != user.id and user.role != "admin":
            raise PermissionError("You don't have access to this scan")

        return scan

    @staticmethod
    def list_user_scans(
        db: Session, user: User, skip: int = 0, limit: int = 50
    ) -> Tuple[List[Scan], int]:
        """List user's scans"""
        query = db.query(Scan).filter(Scan.user_id == user.id)
        total = query.count()
        scans = query.order_by(Scan.created_at.desc()).offset(skip).limit(limit).all()
        return scans, total

    @staticmethod
    def update_scan(
        db: Session,
        scan: Scan,
        notes: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> Scan:
        """Update scan metadata"""
        if notes is not None:
            scan.notes = notes

        if tags is not None:
            # Remove old tags
            db.query(ScanTag).filter(ScanTag.scan_id == scan.id).delete()
            # Add new tags
            for tag in tags:
                scan_tag = ScanTag(scan_id=scan.id, tag=tag)
                db.add(scan_tag)

        db.commit()
        db.refresh(scan)
        return scan

    @staticmethod
    def delete_scan(db: Session, scan: Scan) -> None:
        """Delete scan and its results"""
        db.delete(scan)
        db.commit()

    @staticmethod
    def start_scan(db: Session, scan: Scan, target_ip: str) -> Scan:
        """Start port scanning"""
        scan.target_ip = target_ip
        scan.status = "running"
        scan.start_time = datetime.utcnow()
        db.commit()

        try:
            scanner = get_scanner(scan.timeout_seconds, scan.workers_count)
            from app.core.scanner import PRESET_PROFILES

            preset_ports = None
            if scan.notes and "preset:" in scan.notes:
                for line in scan.notes.split("\n"):
                    if line.startswith("preset:"):
                        profile = line.split(":", 1)[1].strip()
                        if profile in PRESET_PROFILES:
                            preset_ports = PRESET_PROFILES[profile]

            if preset_ports:
                open_ports = scanner.scan_ports(target_ip, preset_ports)
            else:
                open_ports = scanner.scan_port_range(
                    target_ip, scan.port_range_start, scan.port_range_end
                )

            # Get service detector
            detector = get_detector()

            # Store results
            for port in open_ports:
                service_name = detector.get_service_name(port)
                result = ScanResult(
                    scan_id=scan.id,
                    port=port,
                    is_open=True,
                    service_name=service_name if service_name != "Unknown" else None,
                    protocol="TCP",
                )
                db.add(result)

            scan.open_ports_count = len(open_ports)
            scan.status = "completed"
            scan.end_time = datetime.utcnow()
            scan.duration_seconds = (scan.end_time - scan.start_time).total_seconds()
            db.commit()
            db.refresh(scan)

        except Exception as e:
            scan.status = "failed"
            scan.end_time = datetime.utcnow()
            db.commit()
            raise

        return scan

    @staticmethod
    def get_scan_results(
        db: Session, scan: Scan, skip: int = 0, limit: int = 50, filter_open: bool = False
    ) -> Tuple[List[ScanResult], int]:
        """Get scan results"""
        query = db.query(ScanResult).filter(ScanResult.scan_id == scan.id)

        if filter_open:
            query = query.filter(ScanResult.is_open == True)

        total = query.count()
        results = query.order_by(ScanResult.port).offset(skip).limit(limit).all()
        return results, total
