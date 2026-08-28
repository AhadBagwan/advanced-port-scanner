"""Scan management router"""

import socket
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.scanner import get_scanner
from app.database.session import get_db
from app.dependencies import get_current_user
from app.models import Scan, User
from app.schemas import (
    PaginatedResponse,
    PaginationParams,
    ResponseModel,
    ScanCreate,
    ScanDetailResponse,
    ScanResponse,
    ScanResultSchema,
    ScanUpdate,
)
from app.services import ScanService
from app.utils import logger
from app.utils.exceptions import AppException, NotFoundError, ValidationError

router = APIRouter(prefix="/api/scans", tags=["scans"])


@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(
    scan_data: ScanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new scan"""
    try:
        # Validate port ranges
        if scan_data.port_range_start > scan_data.port_range_end:
            raise ValidationError("port_range_start must be <= port_range_end")

        if scan_data.port_range_start < 1 or scan_data.port_range_end > 65535:
            raise ValidationError("Port range must be between 1 and 65535")

        # Validate timeout
        from app.config import settings

        if scan_data.timeout < settings.MIN_TIMEOUT or scan_data.timeout > settings.MAX_TIMEOUT:
            raise ValidationError(
                f"Timeout must be between {settings.MIN_TIMEOUT} and {settings.MAX_TIMEOUT}"
            )

        # Validate workers
        if scan_data.max_workers < 1 or scan_data.max_workers > settings.MAX_WORKERS:
            raise ValidationError(f"Workers must be between 1 and {settings.MAX_WORKERS}")

        # Resolve target hostname or CIDR to IP
        from app.core.scanner import parse_target_hosts
        parsed_targets = parse_target_hosts(scan_data.target)
        first_target = parsed_targets[0]
        try:
            target_ip = socket.gethostbyname(first_target)
        except socket.gaierror:
            target_ip = first_target

        notes = scan_data.notes or ""
        if scan_data.preset_profile and scan_data.preset_profile != "custom":
            notes = f"preset:{scan_data.preset_profile}\n" + notes

        # Create scan
        scan = ScanService.create_scan(
            db=db,
            user=current_user,
            target=scan_data.target,
            port_range_start=scan_data.port_range_start,
            port_range_end=scan_data.port_range_end,
            scan_type=scan_data.scan_type,
            timeout=scan_data.timeout,
            max_workers=scan_data.max_workers,
            enable_service_detection=scan_data.enable_service_detection,
            enable_banner_grabbing=scan_data.enable_banner_grabbing,
            tags=scan_data.tags,
            notes=notes,
        )

        # Start scanning synchronously (TODO: use Celery for async)
        ScanService.start_scan(db, scan, target_ip)

        logger.info(f"Scan {scan.id} created and started for {scan_data.target} by user {current_user.id}")

        return ScanResponse.from_orm(scan)

    except AppException as exc:
        logger.error(f"Scan creation error: {exc.message}")
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Unexpected error in create_scan: {str(exc)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("", response_model=dict)
async def list_scans(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    filter_status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List user's scans with pagination"""
    try:
        scans, total = ScanService.list_user_scans(db, current_user, skip=skip, limit=limit)

        # Apply status filter if provided
        if filter_status:
            scans = [s for s in scans if s.status == filter_status]

        items = [ScanResponse.from_orm(scan) for scan in scans]

        return {
            "status": "success",
            "data": PaginatedResponse(items=items, total=total, skip=skip, limit=limit),
            "timestamp": "2026-05-25T15:13:22Z",
        }
    except Exception as exc:
        logger.error(f"Error listing scans: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve scans")


@router.get("/{scan_id}", response_model=dict)
async def get_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get scan details with results"""
    try:
        scan = ScanService.get_scan(db, scan_id, current_user)

        # Get results
        results, _ = ScanService.get_scan_results(db, scan, skip=0, limit=10000)

        from app.core.vulnerability_db import get_port_vulnerability

        result_items = []
        for r in results:
            item = ScanResultSchema.from_orm(r)
            vuln = get_port_vulnerability(r.port, r.service_name)
            item.risk_level = vuln["risk_level"]
            item.vulnerability_description = vuln["description"]
            item.recommendation = vuln["recommendation"]
            result_items.append(item)

        scan_detail = ScanDetailResponse.from_orm(scan)
        scan_detail.results = result_items
        scan_detail.tags = [tag.tag for tag in scan.tags]

        return {
            "status": "success",
            "data": scan_detail,
            "timestamp": "2026-05-25T15:13:22Z",
        }

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        logger.error(f"Error getting scan {scan_id}: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve scan")


@router.get("/{scan_id}/results", response_model=dict)
async def get_scan_results(
    scan_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=10000),
    filter_open: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get scan results with pagination and filtering"""
    try:
        scan = ScanService.get_scan(db, scan_id, current_user)

        results, total = ScanService.get_scan_results(
            db, scan, skip=skip, limit=limit, filter_open=filter_open
        )

        items = []
        for r in results:
            item = ScanResultSchema.from_orm(r)
            vuln = get_port_vulnerability(r.port, r.service_name)
            item.risk_level = vuln["risk_level"]
            item.vulnerability_description = vuln["description"]
            item.recommendation = vuln["recommendation"]
            items.append(item)

        return {
            "status": "success",
            "data": PaginatedResponse(items=items, total=total, skip=skip, limit=limit),
            "timestamp": "2026-05-25T15:13:22Z",
        }

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        logger.error(f"Error getting scan results: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve results")


@router.put("/{scan_id}", response_model=dict)
async def update_scan(
    scan_id: int,
    scan_update: ScanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update scan metadata (notes and tags)"""
    try:
        scan = ScanService.get_scan(db, scan_id, current_user)

        updated_scan = ScanService.update_scan(
            db=db,
            scan=scan,
            notes=scan_update.notes,
            tags=scan_update.tags,
        )

        logger.info(f"Scan {scan_id} updated by user {current_user.id}")

        return {
            "status": "success",
            "data": ScanDetailResponse.from_orm(updated_scan),
            "message": "Scan updated successfully",
            "timestamp": "2026-05-25T15:13:22Z",
        }

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        logger.error(f"Error updating scan {scan_id}: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to update scan")


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete scan and all its results"""
    try:
        scan = ScanService.get_scan(db, scan_id, current_user)

        ScanService.delete_scan(db, scan)

        logger.info(f"Scan {scan_id} deleted by user {current_user.id}")

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        logger.error(f"Error deleting scan {scan_id}: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to delete scan")


@router.get("/compare", response_model=dict)
async def compare_scans(
    scan_id1: int = Query(..., description="First scan ID"),
    scan_id2: int = Query(..., description="Second scan ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compare two scan results and return detailed diff"""
    try:
        scan1 = ScanService.get_scan(db, scan_id1, current_user)
        scan2 = ScanService.get_scan(db, scan_id2, current_user)

        results1, _ = ScanService.get_scan_results(db, scan1, limit=10000)
        results2, _ = ScanService.get_scan_results(db, scan2, limit=10000)

        ports1 = {r.port: r for r in results1}
        ports2 = {r.port: r for r in results2}

        all_ports = sorted(list(set(ports1.keys()) | set(ports2.keys())))

        added_ports = [p for p in all_ports if p not in ports1 and p in ports2]
        removed_ports = [p for p in all_ports if p in ports1 and p not in ports2]
        common_ports = [p for p in all_ports if p in ports1 and p in ports2]

        details = []
        for p in all_ports:
            s1 = ports1.get(p)
            s2 = ports2.get(p)
            change_type = "unchanged"
            if p in added_ports:
                change_type = "added"
            elif p in removed_ports:
                change_type = "removed"
            elif s1 and s2 and s1.service_name != s2.service_name:
                change_type = "modified"

            details.append({
                "port": p,
                "service_name": (s2 or s1).service_name if (s2 or s1) else None,
                "status_scan1": "open" if s1 else "closed",
                "status_scan2": "open" if s2 else "closed",
                "change_type": change_type,
            })

        return {
            "status": "success",
            "data": {
                "scan1": ScanResponse.from_orm(scan1),
                "scan2": ScanResponse.from_orm(scan2),
                "added_ports": added_ports,
                "removed_ports": removed_ports,
                "common_ports": common_ports,
                "details": details,
            }
        }
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Error comparing scans {scan_id1} and {scan_id2}: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to compare scans")


@router.post("/{scan_id}/export", response_model=dict)
async def export_scan(
    scan_id: int,
    format: str = Query("json", pattern="^(json|csv|xml|pdf)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export scan results in specified format"""
    try:
        scan = ScanService.get_scan(db, scan_id, current_user)

        results, _ = ScanService.get_scan_results(db, scan, skip=0, limit=10000)

        if format == "pdf":
            export_data = {
                "scan": ScanResponse.from_orm(scan),
                "title": f"Security Assessment Report - {scan.target_host}",
                "generated_at": scan.created_at.isoformat(),
                "summary": f"Target {scan.target_host} ({scan.target_ip}) scanned. Found {scan.open_ports_count} open ports.",
                "open_ports": [
                    {
                        "port": r.port,
                        "service": r.service_name or "Unknown",
                        "protocol": r.protocol,
                    }
                    for r in results
                ],
            }
        elif format == "json":
            export_data = {
                "scan": {
                    "id": scan.id,
                    "target_host": scan.target_host,
                    "target_ip": scan.target_ip,
                    "status": scan.status,
                    "port_range": f"{scan.port_range_start}-{scan.port_range_end}",
                    "open_ports_count": scan.open_ports_count,
                    "duration_seconds": scan.duration_seconds,
                    "created_at": scan.created_at.isoformat(),
                },
                "results": [
                    {
                        "port": r.port,
                        "is_open": r.is_open,
                        "service": r.service_name,
                        "protocol": r.protocol,
                    }
                    for r in results
                ],
            }

        elif format == "csv":
            csv_lines = ["port,is_open,service,protocol"]
            for r in results:
                csv_lines.append(f"{r.port},{r.is_open},{r.service_name or 'Unknown'},{r.protocol}")
            export_data = "\n".join(csv_lines)

        elif format == "xml":
            xml_lines = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                "<scan>",
                f"  <target>{scan.target_host}</target>",
                f"  <ip>{scan.target_ip}</ip>",
                f"  <open_ports>{scan.open_ports_count}</open_ports>",
                "  <results>",
            ]
            for r in results:
                xml_lines.append(
                    f'    <result port="{r.port}" open="{r.is_open}" service="{r.service_name or "Unknown"}" />'
                )
            xml_lines.extend(["  </results>", "</scan>"])
            export_data = "\n".join(xml_lines)

        logger.info(f"Scan {scan_id} exported as {format} by user {current_user.id}")

        return {
            "status": "success",
            "data": export_data,
            "format": format,
            "timestamp": "2026-05-25T15:13:22Z",
        }

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        logger.error(f"Error exporting scan {scan_id}: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to export scan")


@router.get("/{scan_id}/export", response_model=dict)
async def export_scan_get(
    scan_id: int,
    format: str = Query("json", regex="^(json|csv|xml)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export scan results in specified format (GET endpoint)"""
    try:
        scan = ScanService.get_scan(db, scan_id, current_user)

        results, _ = ScanService.get_scan_results(db, scan, skip=0, limit=10000)

        if format == "json":
            export_data = {
                "scan": {
                    "id": scan.id,
                    "target_host": scan.target_host,
                    "target_ip": scan.target_ip,
                    "status": scan.status,
                    "port_range": f"{scan.port_range_start}-{scan.port_range_end}",
                    "open_ports_count": scan.open_ports_count,
                    "duration_seconds": scan.duration_seconds,
                    "created_at": scan.created_at.isoformat(),
                },
                "results": [
                    {
                        "port": r.port,
                        "is_open": r.is_open,
                        "service": r.service_name,
                        "protocol": r.protocol,
                    }
                    for r in results
                ],
            }

        elif format == "csv":
            csv_lines = ["port,is_open,service,protocol"]
            for r in results:
                csv_lines.append(f"{r.port},{r.is_open},{r.service_name or 'Unknown'},{r.protocol}")
            export_data = "\n".join(csv_lines)

        elif format == "xml":
            xml_lines = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                "<scan>",
                f"  <target>{scan.target_host}</target>",
                f"  <ip>{scan.target_ip}</ip>",
                f"  <open_ports>{scan.open_ports_count}</open_ports>",
                "  <results>",
            ]
            for r in results:
                xml_lines.append(
                    f'    <result port="{r.port}" open="{r.is_open}" service="{r.service_name or "Unknown"}" />'
                )
            xml_lines.extend(["  </results>", "</scan>"])
            export_data = "\n".join(xml_lines)

        logger.info(f"Scan {scan_id} exported as {format} by user {current_user.id}")

        return {
            "status": "success",
            "data": export_data,
            "format": format,
            "timestamp": "2026-05-25T15:13:22Z",
        }

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        logger.error(f"Error exporting scan {scan_id}: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to export scan")


@router.get("/{scan_id}/status", response_model=dict)
async def get_scan_status(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current scan status"""
    try:
        scan = ScanService.get_scan(db, scan_id, current_user)

        return {
            "status": "success",
            "data": {
                "scan_id": scan.id,
                "status": scan.status,
                "open_ports_found": scan.open_ports_count,
                "progress_percent": int((scan.open_ports_count / (scan.port_range_end - scan.port_range_start + 1) * 100))
                if scan.status == "completed"
                else (0 if scan.status == "pending" else 50),
                "duration_seconds": scan.duration_seconds,
                "created_at": scan.created_at.isoformat() if scan.created_at else None,
            },
            "timestamp": "2026-05-25T15:13:22Z",
        }

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        logger.error(f"Error getting scan status: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to get scan status")
