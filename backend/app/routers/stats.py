"""Statistics and analytics router"""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models import Scan, ScanResult, User
from app.utils import logger

router = APIRouter(prefix="/api/stats", tags=["statistics"])


@router.get("", response_model=dict)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's summary statistics"""
    try:
        user_id = current_user.id

        # User scans statistics
        total_scans = (
            db.query(func.count(Scan.id)).filter(Scan.user_id == user_id).scalar()
        )
        completed_scans = (
            db.query(func.count(Scan.id))
            .filter(Scan.user_id == user_id, Scan.status == "completed")
            .scalar()
        )
        running_scans = (
            db.query(func.count(Scan.id))
            .filter(Scan.user_id == user_id, Scan.status == "running")
            .scalar()
        )
        failed_scans = (
            db.query(func.count(Scan.id))
            .filter(Scan.user_id == user_id, Scan.status == "failed")
            .scalar()
        )

        # Ports statistics
        total_ports_scanned = (
            db.query(func.count(ScanResult.id))
            .join(Scan, ScanResult.scan_id == Scan.id)
            .filter(Scan.user_id == user_id)
            .scalar()
        )
        open_ports = (
            db.query(func.count(ScanResult.id))
            .join(Scan, ScanResult.scan_id == Scan.id)
            .filter(Scan.user_id == user_id, ScanResult.is_open == True)
            .scalar()
        )

        # Average metrics
        avg_scan_duration = (
            db.query(func.avg(Scan.duration_seconds))
            .filter(Scan.user_id == user_id, Scan.status == "completed")
            .scalar()
        )
        avg_open_ports = (
            db.query(func.avg(Scan.open_ports_count))
            .filter(Scan.user_id == user_id, Scan.status == "completed")
            .scalar()
        )

        logger.info(f"User {user_id} retrieved statistics")

        return {
            "status": "success",
            "total_scans": total_scans or 0,
            "completed_scans": completed_scans or 0,
            "total_open_ports": open_ports or 0,
            "total_ports_scanned": total_ports_scanned or 0,
            "avg_scan_duration": round(avg_scan_duration or 0, 2),
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as exc:
        logger.error(f"Error calculating statistics: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to calculate statistics")


@router.get("/summary", response_model=dict)
async def get_summary_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's summary statistics"""
    try:
        user_id = current_user.id

        # User scans statistics
        total_scans = (
            db.query(func.count(Scan.id)).filter(Scan.user_id == user_id).scalar()
        )
        completed_scans = (
            db.query(func.count(Scan.id))
            .filter(Scan.user_id == user_id, Scan.status == "completed")
            .scalar()
        )
        running_scans = (
            db.query(func.count(Scan.id))
            .filter(Scan.user_id == user_id, Scan.status == "running")
            .scalar()
        )
        failed_scans = (
            db.query(func.count(Scan.id))
            .filter(Scan.user_id == user_id, Scan.status == "failed")
            .scalar()
        )

        # Ports statistics
        total_ports_scanned = (
            db.query(func.count(ScanResult.id))
            .join(Scan, ScanResult.scan_id == Scan.id)
            .filter(Scan.user_id == user_id)
            .scalar()
        )
        open_ports = (
            db.query(func.count(ScanResult.id))
            .join(Scan, ScanResult.scan_id == Scan.id)
            .filter(Scan.user_id == user_id, ScanResult.is_open == True)
            .scalar()
        )

        # Average metrics
        avg_scan_duration = (
            db.query(func.avg(Scan.duration_seconds))
            .filter(Scan.user_id == user_id, Scan.status == "completed")
            .scalar()
        )
        avg_open_ports = (
            db.query(func.avg(Scan.open_ports_count))
            .filter(Scan.user_id == user_id, Scan.status == "completed")
            .scalar()
        )

        logger.info(f"User {user_id} retrieved summary statistics")

        return {
            "status": "success",
            "data": {
                "scans": {
                    "total": total_scans or 0,
                    "completed": completed_scans or 0,
                    "running": running_scans or 0,
                    "failed": failed_scans or 0,
                },
                "ports": {
                    "total_scanned": total_ports_scanned or 0,
                    "open_found": open_ports or 0,
                    "open_percentage": round(
                        (open_ports / total_ports_scanned * 100)
                        if total_ports_scanned
                        else 0,
                        2,
                    ),
                },
                "averages": {
                    "scan_duration_seconds": round(avg_scan_duration or 0, 2),
                    "open_ports_per_scan": round(avg_open_ports or 0, 2),
                },
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as exc:
        logger.error(f"Error calculating summary stats: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to calculate statistics")


@router.get("/trends", response_model=dict)
async def get_trend_stats(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get scan trends over time"""
    try:
        user_id = current_user.id
        start_date = datetime.utcnow() - timedelta(days=days)

        # Get scans grouped by date
        scans = (
            db.query(
                func.date(Scan.created_at).label("date"),
                func.count(Scan.id).label("scan_count"),
                func.sum(Scan.open_ports_count).label("total_open_ports"),
            )
            .filter(Scan.user_id == user_id, Scan.created_at >= start_date)
            .group_by(func.date(Scan.created_at))
            .order_by(func.date(Scan.created_at))
            .all()
        )

        trend_data = [
            {
                "date": str(scan.date),
                "scan_count": scan.scan_count or 0,
                "total_open_ports": scan.total_open_ports or 0,
            }
            for scan in scans
        ]

        logger.info(f"User {user_id} retrieved trend statistics")

        return {
            "status": "success",
            "data": {
                "period_days": days,
                "trend": trend_data,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as exc:
        logger.error(f"Error calculating trends: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to calculate trends")


@router.get("/top-targets", response_model=dict)
async def get_top_targets(
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get most frequently scanned targets"""
    try:
        user_id = current_user.id

        targets = (
            db.query(
                Scan.target_host,
                Scan.target_ip,
                func.count(Scan.id).label("scan_count"),
                func.sum(Scan.open_ports_count).label("total_open_ports"),
            )
            .filter(Scan.user_id == user_id, Scan.status == "completed")
            .group_by(Scan.target_host, Scan.target_ip)
            .order_by(func.count(Scan.id).desc())
            .limit(limit)
            .all()
        )

        targets_data = [
            {
                "target_host": t.target_host,
                "target_ip": t.target_ip,
                "scan_count": t.scan_count or 0,
                "total_open_ports": t.total_open_ports or 0,
            }
            for t in targets
        ]

        logger.info(f"User {user_id} retrieved top targets")

        return {
            "status": "success",
            "data": {
                "targets": targets_data,
                "total": len(targets_data),
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as exc:
        logger.error(f"Error retrieving top targets: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve top targets")


@router.get("/port-distribution", response_model=dict)
async def get_port_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get distribution of open ports"""
    try:
        user_id = current_user.id

        # Get top 20 most frequently open ports
        port_dist = (
            db.query(
                ScanResult.port,
                func.count(ScanResult.id).label("count"),
            )
            .join(Scan, ScanResult.scan_id == Scan.id)
            .filter(
                Scan.user_id == user_id,
                ScanResult.is_open == True,
                Scan.status == "completed",
            )
            .group_by(ScanResult.port)
            .order_by(func.count(ScanResult.id).desc())
            .limit(20)
            .all()
        )

        port_data = [
            {"port": p.port, "occurrences": p.count}
            for p in port_dist
        ]

        logger.info(f"User {user_id} retrieved port distribution")

        return {
            "status": "success",
            "data": {
                "ports": port_data,
                "total_ports_tracked": len(port_data),
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as exc:
        logger.error(f"Error calculating port distribution: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to calculate distribution")


@router.get("/service-stats", response_model=dict)
async def get_service_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get statistics by service"""
    try:
        user_id = current_user.id

        services = (
            db.query(
                ScanResult.service_name,
                func.count(ScanResult.id).label("count"),
            )
            .join(Scan, ScanResult.scan_id == Scan.id)
            .filter(
                Scan.user_id == user_id,
                ScanResult.is_open == True,
                ScanResult.service_name.isnot(None),
                Scan.status == "completed",
            )
            .group_by(ScanResult.service_name)
            .order_by(func.count(ScanResult.id).desc())
            .limit(20)
            .all()
        )

        service_data = [
            {"service": s.service_name, "count": s.count}
            for s in services
        ]

        logger.info(f"User {user_id} retrieved service statistics")

        return {
            "status": "success",
            "data": {
                "services": service_data,
                "total_services": len(service_data),
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as exc:
        logger.error(f"Error calculating service stats: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to calculate service stats")
