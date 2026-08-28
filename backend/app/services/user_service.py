"""User service"""

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models import User
from app.utils.exceptions import AuthenticationError, ConflictError, NotFoundError


class UserService:
    """User business logic"""

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Get user by ID"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError("User", str(user_id))
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """Get user by email"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise NotFoundError("User", email)
        return user

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> User:
        """Get user by username"""
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise NotFoundError("User", username)
        return user

    @staticmethod
    def create_user(db: Session, username: str, email: str, password: str) -> User:
        """Create new user"""
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == email) | (User.username == username)
        ).first()
        if existing_user:
            raise ConflictError(f"User with email {email} or username {username} already exists")

        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role="user",
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        """Authenticate user by email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password")
        if not user.is_active:
            raise AuthenticationError("User account is inactive")
        return user

    @staticmethod
    def update_user_password(db: Session, user: User, old_password: str, new_password: str) -> User:
        """Update user password"""
        if not verify_password(old_password, user.password_hash):
            raise AuthenticationError("Invalid current password")

        user.password_hash = hash_password(new_password)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 50):
        """List all users (admin only)"""
        total = db.query(User).count()
        users = db.query(User).offset(skip).limit(limit).all()
        return users, total

    @staticmethod
    def delete_user(db: Session, user_id: int) -> None:
        """Delete user (admin only)"""
        user = UserService.get_user_by_id(db, user_id)
        db.delete(user)
        db.commit()

    @staticmethod
    def update_user_role(db: Session, user_id: int, role: str) -> User:
        """Update user role (admin only)"""
        user = UserService.get_user_by_id(db, user_id)
        if role not in ["user", "admin", "viewer"]:
            raise ValueError("Invalid role")
        user.role = role
        db.commit()
        db.refresh(user)
        return user
