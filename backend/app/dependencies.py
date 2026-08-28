from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from starlette.authentication import AuthCredentials
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_token, get_user_from_token
from app.database.session import SessionLocal, get_db
from app.models import User
from app.utils.exceptions import AuthenticationError

security = HTTPBearer()


async def get_current_user(
    credentials = Depends(security), db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token in Authorization header"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authenticated",
        )
    token = credentials.credentials
    try:
        user_id = get_user_from_token(token)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current authenticated admin user"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
