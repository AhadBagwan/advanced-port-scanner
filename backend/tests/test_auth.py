"""Test auth endpoints"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import User

client = TestClient(app)


def test_register_user(test_db):
    """Test user registration"""
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 201
    assert response.json()["username"] == "testuser"


def test_register_duplicate_email(test_db):
    """Test duplicate email registration"""
    client.post(
        "/api/auth/register",
        json={
            "username": "user1",
            "email": "test@example.com",
            "password": "password123",
        },
    )
    response = client.post(
        "/api/auth/register",
        json={
            "username": "user2",
            "email": "test@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 409


def test_login(test_db):
    """Test user login"""
    # Register user first
    client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )

    # Login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(test_db):
    """Test login with invalid credentials"""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401
