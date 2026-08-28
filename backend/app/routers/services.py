"""Services information router"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.service_detector import get_detector
from app.database.session import get_db
from app.dependencies import get_current_user
from app.models import User
from app.utils import logger

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=dict)
async def get_all_services(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all known services"""
    try:
        detector = get_detector()
        services = detector.get_all_services()

        services_list = [
            {"port": port, "name": info.get("name"), "description": info.get("description")}
            for port, info in services.items()
        ]

        logger.info(f"User {current_user.id} retrieved services list")

        return {
            "status": "success",
            "data": {
                "services": services_list,
                "total": len(services_list),
            },
            "timestamp": "2026-05-25T15:13:22Z",
        }

    except Exception as exc:
        logger.error(f"Error retrieving services: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve services")


@router.get("/{port}", response_model=dict)
async def get_service_by_port(
    port: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get service information for a specific port"""
    try:
        if port < 1 or port > 65535:
            raise HTTPException(status_code=400, detail="Port must be between 1 and 65535")

        detector = get_detector()
        service = detector.get_service(port)

        if not service:
            return {
                "status": "success",
                "data": {
                    "port": port,
                    "name": "Unknown",
                    "description": "Service not in database",
                },
                "timestamp": "2026-05-25T15:13:22Z",
            }

        logger.info(f"User {current_user.id} looked up service for port {port}")

        return {
            "status": "success",
            "data": {
                "port": port,
                "name": service.get("name"),
                "description": service.get("description"),
            },
            "timestamp": "2026-05-25T15:13:22Z",
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error retrieving service info: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve service info")


@router.post("", response_model=dict, status_code=201)
async def add_service(
    port: int,
    name: str,
    description: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add or update service (admin only)"""
    from app.dependencies import get_current_admin

    current_user = await get_current_admin(current_user)

    try:
        if port < 1 or port > 65535:
            raise HTTPException(status_code=400, detail="Port must be between 1 and 65535")

        detector = get_detector()
        detector.add_service(port, name, description)

        logger.info(f"Admin {current_user.id} added/updated service {name} on port {port}")

        return {
            "status": "success",
            "data": {
                "port": port,
                "name": name,
                "description": description,
            },
            "message": f"Service {name} added for port {port}",
            "timestamp": "2026-05-25T15:13:22Z",
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error adding service: {str(exc)}")
        raise HTTPException(status_code=500, detail="Failed to add service")
