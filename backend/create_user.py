import sys
sys.path.insert(0, '.')

from app.database.session import Base, engine, SessionLocal
from app.models import User
from app.core.security import hash_password

session = SessionLocal()

try:
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Check if user already exists
    existing = session.query(User).filter(User.email == "bagwanahad@gmail.com").first()
    if existing:
        existing.password_hash = hash_password("65432165")
        existing.is_active = True
        session.commit()
        print(f"[OK] User updated! ID: {existing.id}")
    else:
        # Create new user
        new_user = User(
            username="bagwanahad",
            email="bagwanahad@gmail.com",
            password_hash=hash_password("65432165"),
            role="user",
            is_active=True
        )
        session.add(new_user)
        session.commit()
        print(f"[OK] User created! ID: {new_user.id}")
        
    # Also create admin user for testing
    admin = session.query(User).filter(User.email == "admin@example.com").first()
    if admin:
        admin.password_hash = hash_password("admin123")
        admin.is_active = True
        session.commit()
        print(f"[OK] Admin user updated! ID: {admin.id}")
    else:
        new_admin = User(
            username="admin",
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            role="admin",
            is_active=True
        )
        session.add(new_admin)
        session.commit()
        print(f"[OK] Admin user created! ID: {new_admin.id}")

    # Also create guest user
    guest = session.query(User).filter(User.email == "guest@example.com").first()
    if guest:
        guest.password_hash = hash_password("guest12345")
        guest.is_active = True
        session.commit()
        print(f"[OK] Guest user updated! ID: {guest.id}")
    else:
        new_guest = User(
            username="guest_user",
            email="guest@example.com",
            password_hash=hash_password("guest12345"),
            role="user",
            is_active=True
        )
        session.add(new_guest)
        session.commit()
        print(f"[OK] Guest user created! ID: {new_guest.id}")
        
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    session.close()
