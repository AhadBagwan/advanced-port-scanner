import hashlib
import sqlite3
from datetime import datetime

def hash_password(password):
    return hashlib.pbkdf2_hmac('sha256', password.encode(), b'salt', 100000).hex()

try:
    conn = sqlite3.connect("port_scanner.db")
    cursor = conn.cursor()
    
    # Update user passwords with new algorithm
    admin_hash = hash_password("admin123")
    bagwana_hash = hash_password("65432165")
    
    cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", (admin_hash, "admin@example.com"))
    cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", (bagwana_hash, "bagwanahad@gmail.com"))
    
    conn.commit()
    print("✅ Passwords rehashed successfully!")
    
    # Verify
    cursor.execute("SELECT email, password_hash FROM users LIMIT 2")
    for email, pwd_hash in cursor.fetchall():
        print(f"  {email}: {pwd_hash[:20]}...")
    
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
