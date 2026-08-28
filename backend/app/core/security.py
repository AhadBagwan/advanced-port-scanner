"""Security utilities for JWT and password hashing"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import hashlib

from jose import JWTError, jwt

from app.config import settings
from app.utils.exceptions import AuthenticationError


def hash_password(password: str) -> str:
    """Hash a password using SHA256 (simple, cross-platform alternative to bcrypt)"""
    # Use PBKDF2 for better security than plain SHA
    return hashlib.pbkdf2_hmac('sha256', password.encode(), b'salt', 100000).hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return hashlib.pbkdf2_hmac('sha256', plain_password.encode(), b'salt', 100000).hex() == hashed_password
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    # Ensure 'sub' is a string
    if 'sub' in to_encode:
        to_encode['sub'] = str(to_encode['sub'])

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    
    # Ensure 'sub' is a string
    if 'sub' in to_encode:
        to_encode['sub'] = str(to_encode['sub'])
    
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError as exc:
        raise AuthenticationError("Invalid or expired token") from exc


def get_user_from_token(token: str) -> int:
    """Extract user_id from token"""
    payload = decode_token(token)
    user_id_str: Optional[str] = payload.get("sub")

    if user_id_str is None:
        raise AuthenticationError("Invalid token: user_id not found")

    try:
        return int(user_id_str)
    except (ValueError, TypeError):
        raise AuthenticationError("Invalid token: user_id must be numeric")
