"""Celery tasks for asynchronous operations"""

from celery import Celery

from app.config import settings

celery_app = Celery(
    "port_scanner",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(name="scan_ports")
def scan_ports_task(scan_id: int, target_ip: str, start_port: int, end_port: int):
    """Asynchronous port scanning task"""
    from sqlalchemy.orm import Session

    from app.database.session import SessionLocal
    from app.models import Scan
    from app.services import ScanService

    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if scan:
            ScanService.start_scan(db, scan, target_ip)
    finally:
        db.close()
