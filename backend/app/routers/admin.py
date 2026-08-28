"""Admin management router"""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_admin, get_current_user
from app.models import AuditLog, Scan, ScanResult, User
from app.schemas import ResponseModel, UserResponse
from app.services import UserService
from app.utils import logger
from app.utils.exceptions import AppException, NotFoundError

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=dict)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    role_filter: str = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List all users (admin only)"""
    try:
        users, total = UserService.list_users(db, skip=skip, limit=limit)

        # Apply role filter if provided
        if role_filter:
            users = [u for u in users if u.role == role_filter]
            total = len(users)

        users_data = [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ]

        logger.info(f"Admin {current_admin.id} listed users")

        return {
            "status": "success",
            "data": {
                "items": users_data,
                "total": total,
                "skip": skip,
                "limit": limit,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as exc:
        logger.error(f"Error listing users: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve users")


@router.get("/users/{user_id}", response_model=dict)
async def get_user_details(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get user details including scan statistics"""
    try:
        user = UserService.get_user_by_id(db, user_id)

        # Get user statistics
        scan_count = db.query(func.count(Scan.id)).filter(Scan.user_id == user_id).scalar()
        total_ports_scanned = (
            db.query(func.count(ScanResult.id))
            .join(Scan, ScanResult.scan_id == Scan.id)
            .filter(Scan.user_id == user_id)
            .scalar()
        )
        open_ports_found = (
            db.query(func.count(ScanResult.id))
            .join(Scan, ScanResult.scan_id == Scan.id)
            .filter(Scan.user_id == user_id, ScanResult.is_open == True)
            .scalar()
        )

        logger.info(f"Admin {current_admin.id} viewed user {user_id} details")

        return {
            "status": "success",
            "data": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat(),
                "statistics": {
                    "scan_count": scan_count or 0,
                    "total_ports_scanned": total_ports_scanned or 0,
                    "open_ports_found": open_ports_found or 0,
                },
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except Exception as exc:
        logger.error(f"Error getting user details: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user")


@router.put("/users/{user_id}/role", response_model=dict, status_code=status.HTTP_200_OK)
async def update_user_role(
    user_id: int,
    new_role: str = Query(..., regex="^(admin|user|viewer)$"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update user role (admin only)"""
    try:
        if user_id == current_admin.id:
            raise HTTPException(
                status_code=400, detail="Cannot change your own role"
            )

        user = UserService.update_user_role(db, user_id, new_role)

        logger.info(f"Admin {current_admin.id} updated user {user_id} role to {new_role}")

        return {
            "status": "success",
            "data": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
            },
            "message": f"User role updated to {new_role}",
            "timestamp": datetime.utcnow().isoformat(),
        }

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        logger.error(f"Error updating user role: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to update user role")


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete user and all associated data (admin only)"""
    try:
        if user_id == current_admin.id:
            raise HTTPException(
                status_code=400, detail="Cannot delete your own account"
            )

        UserService.delete_user(db, user_id)

        logger.info(f"Admin {current_admin.id} deleted user {user_id}")

    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.message)
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        logger.error(f"Error deleting user: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to delete user")


@router.get("/audit-logs", response_model=dict)
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id_filter: int = Query(None),
    action_filter: str = Query(None),
    days_back: int = Query(7, ge=1, le=365),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get audit logs (admin only)"""
    try:
        # Filter by date range
        start_date = datetime.utcnow() - timedelta(days=days_back)

        query = db.query(AuditLog).filter(AuditLog.timestamp >= start_date)

        # Apply filters
        if user_id_filter:
            query = query.filter(AuditLog.user_id == user_id_filter)

        if action_filter:
            query = query.filter(AuditLog.action.ilike(f"%{action_filter}%"))

        total = query.count()
        logs = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

        logs_data = [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "details": log.details,
                "timestamp": log.timestamp.isoformat(),
            }
            for log in logs
        ]

        logger.info(f"Admin {current_admin.id} viewed audit logs")

        return {
            "status": "success",
            "data": {
                "items": logs_data,
                "total": total,
                "skip": skip,
                "limit": limit,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as exc:
        logger.error(f"Error retrieving audit logs: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve audit logs")


@router.get("/stats/summary", response_model=dict)
async def get_system_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get system statistics (admin only)"""
    try:
        total_users = db.query(func.count(User.id)).scalar()
        active_users = (
            db.query(func.count(User.id)).filter(User.is_active == True).scalar()
        )
        admin_count = db.query(func.count(User.id)).filter(User.role == "admin").scalar()

        total_scans = db.query(func.count(Scan.id)).scalar()
        completed_scans = (
            db.query(func.count(Scan.id)).filter(Scan.status == "completed").scalar()
        )
        failed_scans = (
            db.query(func.count(Scan.id)).filter(Scan.status == "failed").scalar()
        )

        total_ports_scanned = db.query(func.count(ScanResult.id)).scalar()
        open_ports_found = (
            db.query(func.count(ScanResult.id)).filter(ScanResult.is_open == True).scalar()
        )

        avg_scan_duration = (
            db.query(func.avg(Scan.duration_seconds))
            .filter(Scan.status == "completed")
            .scalar()
        )

        logger.info(f"Admin {current_admin.id} viewed system statistics")

        return {
            "status": "success",
            "data": {
                "users": {
                    "total": total_users or 0,
                    "active": active_users or 0,
                    "admins": admin_count or 0,
                },
                "scans": {
                    "total": total_scans or 0,
                    "completed": completed_scans or 0,
                    "failed": failed_scans or 0,
                    "avg_duration_seconds": round(avg_scan_duration or 0, 2),
                },
                "ports": {
                    "total_scanned": total_ports_scanned or 0,
                    "open_found": open_ports_found or 0,
                    "open_percentage": round(
                        (open_ports_found / total_ports_scanned * 100)
                        if total_ports_scanned
                        else 0,
                        2,
                    ),
                },
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as exc:
        logger.error(f"Error calculating system stats: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to calculate statistics")
