import bcrypt
import sqlite3
from datetime import datetime

try:
    # Hash the password
    password = "65432165"
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    print(f"✅ Password hashed: {hashed.decode('utf-8')}")
    
    # Update the user with real password hash
    conn = sqlite3.connect("port_scanner.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE users 
        SET password_hash = ?
        WHERE email = ?
    """, (
        hashed.decode('utf-8'),
        "bagwanahad@gmail.com"
    ))
    conn.commit()
    print(f"✅ User password updated!")
    
    # Also add admin user if it doesn't exist
    admin_hashed = bcrypt.hashpw(b"admin123", bcrypt.gensalt())
    try:
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "admin",
            "admin@example.com", 
            admin_hashed.decode('utf-8'),
            "admin",
            1,
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        conn.commit()
        print("✅ Admin user created: admin@example.com / admin123")
    except sqlite3.IntegrityError:
        print("⚠️  Admin user already exists")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
