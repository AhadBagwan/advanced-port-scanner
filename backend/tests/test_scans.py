"""Test scan endpoints"""

import pytest
from fastapi.testclient import TestClient

from app.database.session import SessionLocal
from app.main import app
from app.models import Scan, User
from app.services import UserService

client = TestClient(app)


@pytest.fixture
def auth_token(test_db):
    """Create test user and get auth token"""
    # Register user
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
        },
    )
    assert response.status_code == 201

    # Login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123",
        },
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_create_scan(auth_token):
    """Test scan creation"""
    response = client.post(
        "/api/scans",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "target": "127.0.0.1",
            "port_range_start": 80,
            "port_range_end": 85,
            "scan_type": "standard",
            "timeout": 0.5,
            "max_workers": 50,
            "enable_service_detection": True,
            "tags": ["test"],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["target_ip"] == "127.0.0.1"
    assert data["status"] == "completed"


def test_list_scans(auth_token):
    """Test listing scans"""
    response = client.get(
        "/api/scans",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


def test_get_scan_details(auth_token):
    """Test getting scan details"""
    # Create a scan first
    create_response = client.post(
        "/api/scans",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "target": "127.0.0.1",
            "port_range_start": 80,
            "port_range_end": 85,
            "scan_type": "standard",
            "timeout": 0.5,
            "max_workers": 50,
        },
    )
    assert create_response.status_code == 201
    scan_id = create_response.json()["id"]

    # Get details
    response = client.get(
        f"/api/scans/{scan_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == scan_id


def test_get_scan_results(auth_token):
    """Test getting scan results"""
    # Create a scan first
    create_response = client.post(
        "/api/scans",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "target": "127.0.0.1",
            "port_range_start": 80,
            "port_range_end": 85,
            "scan_type": "standard",
            "timeout": 0.5,
            "max_workers": 50,
        },
    )
    scan_id = create_response.json()["id"]

    # Get results
    response = client.get(
        f"/api/scans/{scan_id}/results",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "data" in data


def test_update_scan(auth_token):
    """Test updating scan"""
    # Create a scan
    create_response = client.post(
        "/api/scans",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "target": "127.0.0.1",
            "port_range_start": 80,
            "port_range_end": 85,
            "scan_type": "standard",
            "timeout": 0.5,
            "max_workers": 50,
        },
    )
    scan_id = create_response.json()["id"]

    # Update
    response = client.put(
        f"/api/scans/{scan_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "notes": "Updated notes",
            "tags": ["updated"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["notes"] == "Updated notes"


def test_export_scan(auth_token):
    """Test scan export"""
    # Create a scan
    create_response = client.post(
        "/api/scans",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "target": "127.0.0.1",
            "port_range_start": 80,
            "port_range_end": 85,
            "scan_type": "standard",
            "timeout": 0.5,
            "max_workers": 50,
        },
    )
    scan_id = create_response.json()["id"]

    # Export as JSON
    response = client.post(
        f"/api/scans/{scan_id}/export?format=json",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "json"

    # Export as CSV
    response = client.post(
        f"/api/scans/{scan_id}/export?format=csv",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    assert response.json()["format"] == "csv"
