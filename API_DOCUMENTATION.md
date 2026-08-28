# Port Scanner API Documentation

## Complete API Reference

### Base URL
```
http://localhost:8000
```

### API Documentation UIs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Authentication

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "myuser",
  "email": "user@example.com",
  "password": "securepass123"
}

Response (201):
{
  "id": 1,
  "username": "myuser",
  "email": "user@example.com",
  "role": "user",
  "is_active": true
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}

Response (200):
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Refresh Token
```
POST /api/auth/refresh
{
  "token": "refresh_token_here"
}

Response (200):
{
  "access_token": "new_access_token",
  "refresh_token": "same_refresh_token",
  "token_type": "bearer"
}
```

### Logout
```
POST /api/auth/logout

Response (200):
{
  "message": "Logged out successfully"
}
```

---

## Scans Management

### Headers
All scan endpoints require:
```
Authorization: Bearer <access_token>
```

### Create Scan
```
POST /api/scans
Content-Type: application/json
Authorization: Bearer <token>

{
  "target": "example.com",
  "port_range_start": 20,
  "port_range_end": 1024,
  "scan_type": "standard",
  "timeout": 0.5,
  "max_workers": 200,
  "enable_service_detection": true,
  "enable_banner_grabbing": false,
  "tags": ["production", "monitoring"],
  "notes": "Weekly security scan"
}

Response (201):
{
  "id": 1,
  "target_host": "example.com",
  "target_ip": "93.184.216.34",
  "status": "completed",
  "port_range_start": 20,
  "port_range_end": 1024,
  "open_ports_count": 3,
  "duration_seconds": 45.23,
  "created_at": "2026-05-25T15:13:22Z",
  "updated_at": "2026-05-25T15:13:22Z"
}
```

### List Scans
```
GET /api/scans?skip=0&limit=50&filter_status=completed
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "target_host": "example.com",
        "target_ip": "93.184.216.34",
        "status": "completed",
        "open_ports_count": 3,
        "duration_seconds": 45.23,
        "created_at": "2026-05-25T15:13:22Z",
        "updated_at": "2026-05-25T15:13:22Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 50,
    "pages": 1
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get Scan Details
```
GET /api/scans/{scan_id}
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "id": 1,
    "target_host": "example.com",
    "target_ip": "93.184.216.34",
    "status": "completed",
    "port_range_start": 20,
    "port_range_end": 1024,
    "open_ports_count": 3,
    "duration_seconds": 45.23,
    "timeout_seconds": 0.5,
    "workers_count": 200,
    "scan_type": "standard",
    "enable_service_detection": true,
    "enable_banner_grabbing": false,
    "start_time": "2026-05-25T15:00:00Z",
    "end_time": "2026-05-25T15:00:45Z",
    "notes": "Weekly security scan",
    "results": [
      {
        "id": 1,
        "port": 80,
        "is_open": true,
        "service_name": "HTTP",
        "service_version": null,
        "response_time_ms": 25.5,
        "protocol": "TCP"
      }
    ],
    "tags": ["production", "monitoring"]
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get Scan Results
```
GET /api/scans/{scan_id}/results?skip=0&limit=100&filter_open=true
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "port": 80,
        "is_open": true,
        "service_name": "HTTP",
        "service_version": null,
        "response_time_ms": 25.5,
        "protocol": "TCP"
      },
      {
        "id": 2,
        "port": 443,
        "is_open": true,
        "service_name": "HTTPS",
        "service_version": null,
        "response_time_ms": 28.3,
        "protocol": "TCP"
      }
    ],
    "total": 3,
    "skip": 0,
    "limit": 100,
    "pages": 1
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get Scan Status
```
GET /api/scans/{scan_id}/status
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "scan_id": 1,
    "status": "completed",
    "open_ports_found": 3,
    "progress_percent": 100,
    "duration_seconds": 45.23,
    "created_at": "2026-05-25T15:13:22Z"
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Update Scan
```
PUT /api/scans/{scan_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "notes": "Updated notes",
  "tags": ["updated", "v2"]
}

Response (200):
{
  "status": "success",
  "data": {
    "id": 1,
    "target_host": "example.com",
    ...
  },
  "message": "Scan updated successfully",
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Delete Scan
```
DELETE /api/scans/{scan_id}
Authorization: Bearer <token>

Response (204): No Content
```

### Export Scan
```
POST /api/scans/{scan_id}/export?format=json
Authorization: Bearer <token>

Formats: json, csv, xml

Response (200):
{
  "status": "success",
  "data": {
    "scan": {
      "id": 1,
      "target_host": "example.com",
      "target_ip": "93.184.216.34",
      "status": "completed",
      "port_range": "20-1024",
      "open_ports_count": 3,
      "duration_seconds": 45.23,
      "created_at": "2026-05-25T15:13:22Z"
    },
    "results": [
      {
        "port": 80,
        "is_open": true,
        "service": "HTTP",
        "protocol": "TCP"
      }
    ]
  },
  "format": "json",
  "timestamp": "2026-05-25T15:13:22Z"
}
```

---

## Services

### Get All Services
```
GET /api/services
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "services": [
      {
        "port": 80,
        "name": "HTTP",
        "description": "Hypertext Transfer Protocol"
      },
      {
        "port": 443,
        "name": "HTTPS",
        "description": "HTTP Secure"
      }
    ],
    "total": 25
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get Service by Port
```
GET /api/services/{port}
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "port": 80,
    "name": "HTTP",
    "description": "Hypertext Transfer Protocol"
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Add/Update Service (Admin Only)
```
POST /api/services?port=8080&name=HTTP-Alt&description=HTTP Alternate
Authorization: Bearer <admin_token>

Response (201):
{
  "status": "success",
  "data": {
    "port": 8080,
    "name": "HTTP-Alt",
    "description": "HTTP Alternate"
  },
  "message": "Service HTTP-Alt added for port 8080",
  "timestamp": "2026-05-25T15:13:22Z"
}
```

---

## Statistics

### Get Summary Statistics
```
GET /api/stats/summary
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "scans": {
      "total": 10,
      "completed": 9,
      "running": 0,
      "failed": 1
    },
    "ports": {
      "total_scanned": 5420,
      "open_found": 45,
      "open_percentage": 0.83
    },
    "averages": {
      "scan_duration_seconds": 45.23,
      "open_ports_per_scan": 4.5
    }
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get Trends
```
GET /api/stats/trends?days=30
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "period_days": 30,
    "trend": [
      {
        "date": "2026-05-25",
        "scan_count": 2,
        "total_open_ports": 8
      }
    ]
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get Top Targets
```
GET /api/stats/top-targets?limit=10
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "targets": [
      {
        "target_host": "example.com",
        "target_ip": "93.184.216.34",
        "scan_count": 5,
        "total_open_ports": 15
      }
    ],
    "total": 1
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get Port Distribution
```
GET /api/stats/port-distribution
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "ports": [
      {
        "port": 80,
        "occurrences": 25
      },
      {
        "port": 443,
        "occurrences": 20
      }
    ],
    "total_ports_tracked": 2
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get Service Statistics
```
GET /api/stats/service-stats
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "services": [
      {
        "service": "HTTP",
        "count": 25
      },
      {
        "service": "HTTPS",
        "count": 20
      }
    ],
    "total_services": 2
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

---

## Admin Endpoints

All admin endpoints require role = "admin"

### List All Users
```
GET /api/admin/users?skip=0&limit=50&role_filter=user
Authorization: Bearer <admin_token>

Response (200):
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 2,
        "username": "testuser",
        "email": "user@example.com",
        "role": "user",
        "is_active": true,
        "created_at": "2026-05-25T15:13:22Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 50
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get User Details
```
GET /api/admin/users/{user_id}
Authorization: Bearer <admin_token>

Response (200):
{
  "status": "success",
  "data": {
    "id": 2,
    "username": "testuser",
    "email": "user@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2026-05-25T15:13:22Z",
    "statistics": {
      "scan_count": 10,
      "total_ports_scanned": 5420,
      "open_ports_found": 45
    }
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Update User Role
```
PUT /api/admin/users/{user_id}/role?new_role=admin
Authorization: Bearer <admin_token>

Response (200):
{
  "status": "success",
  "data": {
    "id": 2,
    "username": "testuser",
    "role": "admin"
  },
  "message": "User role updated to admin",
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Delete User
```
DELETE /api/admin/users/{user_id}
Authorization: Bearer <admin_token>

Response (204): No Content
```

### Get Audit Logs
```
GET /api/admin/audit-logs?skip=0&limit=100&days_back=7
Authorization: Bearer <admin_token>

Response (200):
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "user_id": 1,
        "action": "login",
        "resource_type": "user",
        "resource_id": "1",
        "details": "User logged in",
        "timestamp": "2026-05-25T15:13:22Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 100
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

### Get System Statistics
```
GET /api/admin/stats/summary
Authorization: Bearer <admin_token>

Response (200):
{
  "status": "success",
  "data": {
    "users": {
      "total": 10,
      "active": 8,
      "admins": 2
    },
    "scans": {
      "total": 100,
      "completed": 95,
      "failed": 5,
      "avg_duration_seconds": 45.23
    },
    "ports": {
      "total_scanned": 54200,
      "open_found": 450,
      "open_percentage": 0.83
    }
  },
  "timestamp": "2026-05-25T15:13:22Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "detail": "Admin access required"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found: Scan"
}
```

### 409 Conflict
```json
{
  "detail": "User with email user@example.com already exists"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Query Parameters

### Pagination
- `skip`: Number of items to skip (default: 0)
- `limit`: Number of items to return (default: 50, max: 1000)

### Filtering
- `filter_status`: Filter scans by status (pending, running, completed, failed)
- `filter_open`: Filter results to show only open ports (true/false)
- `role_filter`: Filter users by role (admin, user, viewer)

### Statistics
- `days`: Number of days to analyze (default: 30, max: 365)

### Export
- `format`: Export format (json, csv, xml)

---

## Rate Limiting

Default: 100 requests per minute per user

When rate limited:
```
429 Too Many Requests
Retry-After: 60
```

---

## Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict |
| 500 | Internal Server Error - Server error |

