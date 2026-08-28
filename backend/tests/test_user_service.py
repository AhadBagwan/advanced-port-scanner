"""Test user service"""

import pytest

from app.models import User
from app.services import UserService
from app.utils.exceptions import AuthenticationError, ConflictError


def test_create_user(test_db):
    """Test user creation"""
    user = UserService.create_user(
        test_db, "testuser", "test@example.com", "password123"
    )
    assert user.username == "testuser"
    assert user.email == "test@example.com"
    assert user.role == "user"


def test_create_duplicate_email(test_db):
    """Test duplicate email creation"""
    UserService.create_user(
        test_db, "user1", "test@example.com", "password123"
    )
    with pytest.raises(ConflictError):
        UserService.create_user(
            test_db, "user2", "test@example.com", "password123"
        )


def test_authenticate_user(test_db):
    """Test user authentication"""
    UserService.create_user(
        test_db, "testuser", "test@example.com", "password123"
    )
    user = UserService.authenticate_user(
        test_db, "test@example.com", "password123"
    )
    assert user.username == "testuser"


def test_authenticate_invalid_password(test_db):
    """Test authentication with wrong password"""
    UserService.create_user(
        test_db, "testuser", "test@example.com", "password123"
    )
    with pytest.raises(AuthenticationError):
        UserService.authenticate_user(
            test_db, "test@example.com", "wrongpassword"
        )


def test_get_user_by_email(test_db):
    """Test get user by email"""
    UserService.create_user(
        test_db, "testuser", "test@example.com", "password123"
    )
    user = UserService.get_user_by_email(test_db, "test@example.com")
    assert user.username == "testuser"
