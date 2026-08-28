"""Tasks module"""

from app.tasks.scanning import celery_app, scan_ports_task

__all__ = ["celery_app", "scan_ports_task"]
