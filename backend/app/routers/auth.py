"""Authentication router"""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token
from app.database.session import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import PasswordChange, TokenResponse, UserCreate, UserLogin, UserResponse
from app.services import UserService
from app.utils.exceptions import AppException

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    try:
        user = UserService.create_user(db, user_data.username, user_data.email, user_data.password)
        return UserResponse.from_orm(user)
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """User login"""
    try:
        user = UserService.authenticate_user(db, credentials.email, credentials.password)
        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.from_orm(user)
        )
    except AppException as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token: str):
    """Refresh access token using refresh token"""
    from app.core.security import decode_token, get_user_from_token

    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

        user_id = get_user_from_token(token)
        new_access_token = create_access_token({"sub": user_id})
        return TokenResponse(access_token=new_access_token, refresh_token=token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse.from_orm(current_user)


@router.post("/logout")
async def logout():
    """User logout"""
    return {"message": "Logged out successfully"}
