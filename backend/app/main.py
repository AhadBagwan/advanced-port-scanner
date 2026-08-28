"""Main FastAPI application"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.session import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models import AuditLog, Scan, ScanResult, ScanTag, User
from app.routers import admin, auth, scans, services, stats
from app.utils.logger import logger

# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Auto-seed initial admin & guest users if not present or update password hash
    try:
        from app.services.user_service import UserService
        db = SessionLocal()

        # Seed/Update Admin
        try:
            admin_user = UserService.get_user_by_email(db, "admin@example.com")
            admin_user.password_hash = hash_password("admin123")
            db.commit()
            logger.info("Updated admin user password: admin@example.com")
        except Exception:
            UserService.create_user(db, username="admin", email="admin@example.com", password="admin123")
            logger.info("Auto-seeded admin user: admin@example.com")

        # Seed/Update Guest User
        try:
            guest_user = UserService.get_user_by_email(db, "guest@example.com")
            guest_user.password_hash = hash_password("guest12345")
            db.commit()
            logger.info("Updated guest user password: guest@example.com")
        except Exception:
            UserService.create_user(db, username="guest", email="guest@example.com", password="guest12345")
            logger.info("Auto-seeded guest user: guest@example.com")

        db.close()
    except Exception as exc:
        logger.warning(f"Database auto-seeding warning: {exc}")

    yield
    logger.info("Shutting down application")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="TCP Port Scanner API with advanced features",
    lifespan=lifespan,
)

# Add CORS middleware (Allow all production frontend origins matching vercel and localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router)
app.include_router(scans.router)
app.include_router(services.router)
app.include_router(stats.router)
app.include_router(admin.router)


@app.get("/", tags=["health"])
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level=settings.LOG_LEVEL.lower(),
    )
