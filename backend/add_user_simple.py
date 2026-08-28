import sqlite3
from datetime import datetime

try:
    conn = sqlite3.connect("port_scanner.db")
    cursor = conn.cursor()
    
    # Check if users table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    if not cursor.fetchone():
        print("❌ Users table not found. Backend hasn't initialized DB yet.")
    else:
        print("✅ Users table found")
        
        # Try to insert - if it fails due to constraints, that's okay
        try:
            # Using a simple placeholder password (we'll use the API to set real password)
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, role, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                "bagwanahad",
                "bagwanahad@gmail.com", 
                "$2b$12$encrypted_placeholder",  # dummy hash
                "user",
                1,
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            conn.commit()
            print("✅ User bagwanahad@gmail.com created in database")
        except sqlite3.IntegrityError as e:
            print(f"⚠️  User creation failed (maybe already exists): {e}")
            
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
