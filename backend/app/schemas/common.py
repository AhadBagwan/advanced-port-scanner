"""Common Pydantic schemas"""

from datetime import datetime
from typing import Any, Dict, Optional


class ResponseModel(dict):
    """Standard API response model"""

    def __init__(
        self,
        status: str = "success",
        data: Optional[Any] = None,
        error: Optional[str] = None,
        message: Optional[str] = None,
        timestamp: Optional[datetime] = None,
        request_id: Optional[str] = None,
    ):
        if timestamp is None:
            timestamp = datetime.utcnow()

        super().__init__(
            status=status,
            data=data,
            error=error,
            message=message,
            timestamp=timestamp.isoformat() if timestamp else None,
            request_id=request_id,
        )


class PaginationParams:
    """Pagination parameters"""

    def __init__(self, skip: int = 0, limit: int = 50):
        self.skip = max(0, skip)
        self.limit = min(limit, 1000)  # Max 1000 per page


class PaginatedResponse(dict):
    """Paginated response model"""

    def __init__(
        self,
        items: list,
        total: int,
        skip: int = 0,
        limit: int = 50,
    ):
        super().__init__(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            pages=int((total + limit - 1) / limit),
        )
