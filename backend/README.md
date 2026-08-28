# Port Scanner Backend - README

## Quick Start

### Prerequisites
- Python 3.10+
- PostgreSQL 13+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run database migrations** (optional - tables created automatically)
   ```bash
   alembic upgrade head
   ```

6. **Start development server**
   ```bash
   uvicorn app.main:app --reload
   ```
   Server running at http://localhost:8000

### Docker Compose

Run entire stack with one command:
```bash
docker-compose up -d
```

Access services:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432
- Redis: localhost:6379

### API Documentation

Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc

### Environment Variables

See `.env.example` for all configuration options:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `REDIS_URL` - Redis connection
- `CELERY_BROKER_URL` - Celery broker
- `CORS_ORIGINS` - Allowed frontend origins

### Project Structure

```
backend/
├── app/
│   ├── core/         # Business logic (scanner, security)
│   ├── models/       # SQLAlchemy models
│   ├── routers/      # API endpoints
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business layer
│   ├── tasks/        # Celery tasks
│   ├── database/     # DB configuration
│   ├── utils/        # Utilities
│   ├── main.py       # FastAPI app
│   └── config.py     # Settings
├── tests/            # Test files
├── requirements.txt  # Dependencies
└── Dockerfile        # Container image

```

### Testing

Run tests:
```bash
pytest
```

With coverage:
```bash
pytest --cov=app --cov-report=html
```

### Database Migrations (Alembic)

Create migration:
```bash
alembic revision --autogenerate -m "Description"
```

Apply migration:
```bash
alembic upgrade head
```

### Logging

Logs are stored in `logs/` directory:
- `port_scanner.log` - Main application log

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

#### Scans (coming in next phase)
- `POST /api/scans` - Create scan
- `GET /api/scans` - List scans
- `GET /api/scans/{id}` - Get scan details
- `GET /api/scans/{id}/results` - Get scan results

### Troubleshooting

**Port already in use:**
```bash
# Change port in .env or use different port
uvicorn app.main:app --port 8001
```

**Database connection error:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

**Celery not working:**
- Verify Redis is running on port 6379
- Check CELERY_BROKER_URL in .env

### Next Steps

1. Implement remaining API endpoints (scans, admin)
2. Add WebSocket for real-time updates
3. Integrate Celery for async scanning
4. Add comprehensive tests
5. Deploy to production

