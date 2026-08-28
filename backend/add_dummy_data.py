import sqlite3
from datetime import datetime, timedelta
import random

try:
    conn = sqlite3.connect("port_scanner.db")
    cursor = conn.cursor()
    
    # Get user IDs
    cursor.execute("SELECT id FROM users LIMIT 1")
    user = cursor.fetchone()
    if not user:
        print("❌ No users found")
    else:
        user_id = user[0]
        
        # Dummy scan data
        scans = [
            ('192.168.1.1', 'completed', 4, 12.5),
            ('google.com', 'completed', 3, 18.2),
            ('10.0.0.5', 'completed', 6, 14.8),
            ('172.16.0.1', 'completed', 2, 9.3),
            ('example.com', 'completed', 5, 11.1),
        ]
        
        for target, status, open_count, duration in scans:
            try:
                cursor.execute("""
                    INSERT INTO scans (user_id, target_host, status, open_ports_count, total_ports_scanned, scan_duration, started_at, completed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user_id,
                    target,
                    status,
                    open_count,
                    1005,
                    duration,
                    datetime.now().isoformat(),
                    datetime.now().isoformat()
                ))
                scan_id = cursor.lastrowid
                
                # Add some dummy results
                ports = [22, 80, 443, 3306, 5432, 8080, 8443, 27017][:open_count]
                for port in ports:
                    cursor.execute("""
                        INSERT INTO scan_results (scan_id, port, service_name, is_open, protocol)
                        VALUES (?, ?, ?, ?, ?)
                    """, (scan_id, port, f'service_{port}', 1, 'tcp'))
                
                print(f"✅ Added scan: {target} with {open_count} open ports")
            except Exception as e:
                print(f"⚠️  Scan already exists: {target}")
        
        conn.commit()
        print("\n✅ Dummy data loaded successfully!")

    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
