# 🔐 Port Scanner Login Credentials

## System Status
✅ **Backend**: Running on port 8001  
✅ **Frontend**: Running on port 3001  
✅ **Database**: SQLite (port_scanner.db)  

## Access URL
🌐 **Frontend**: http://localhost:3001

---

## Test Accounts

### Admin Account (Full Access)
```
Email: admin@example.com
Password: admin123
Role: admin
```

### Regular User Account
```
Email: bagwanahad@gmail.com
Password: 65432165
Role: user
```

---

## Features Fixed

### ✅ Professional Login Page
- **Animated Background**: Moving grid pattern with floating blur orbs
- **Tech Theme**: Navy/purple gradient with monospace fonts
- **Visual Effects**: 
  - Animated pulsing indicator dots
  - Glowing effects on the login card
  - Hover animations on buttons
  - Password visibility toggle icon
  
### ✅ Authentication System
- **Password Hashing**: PBKDF2-SHA256 (cross-platform, works on Windows)
- **JWT Tokens**: Access token (15 min) + Refresh token (7 days)
- **Error Handling**: Clear error messages on login failure
- **Session Persistence**: Auto-login on page reload

### ✅ User Accounts
- Admin account created and tested
- Regular user account (bagwanahad@gmail.com) created and tested
- Both accounts can login and access dashboard

---

## How to Test

### Method 1: Web Browser
1. Open http://localhost:3001 in your browser
2. Click "Create Account" to register a new account
   - OR use existing test credentials above
3. Enter email and password (minimum 8 characters)
4. Click "SIGN IN"
5. If successful, you'll be redirected to the Dashboard
6. Dashboard shows welcome message and user statistics

### Method 2: API Testing (curl/Postman)

**Login Endpoint:**
```bash
POST http://localhost:8001/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Scanning (Protected)
- `GET /api/scans` - List all scans
- `POST /api/scans` - Create new scan
- `GET /api/scans/{scan_id}` - Get scan details
- And more...

### Health Check
- `GET /api/health` - System health status

---

## Troubleshooting

### Issue: Backend won't start
**Solution**: Check port 8001 is free
```powershell
netstat -ano | Select-String ":8001"
```

### Issue: Frontend won't connect to backend
**Solution**: Verify vite.config.ts has correct proxy:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8001',  // ← should be 8001
    changeOrigin: true,
  },
},
```

### Issue: Login fails with "Internal Server Error"
**Solution**: Check backend logs for bcrypt errors  
→ Already fixed by using PBKDF2-SHA256 instead of bcrypt

### Issue: Password validation says "minimum 8 characters"
**Solution**: Make sure password is at least 8 characters long

---

## File Locations

- **Frontend**: `D:\Ahad\Projects\Portscanner\frontend\`
- **Backend**: `D:\Ahad\Projects\Portscanner\backend\`
- **Database**: `D:\Ahad\Projects\Portscanner\backend\port_scanner.db`
- **Login Page**: `frontend\src\pages\LoginPage.tsx` (Professional design)
- **Security**: `backend\app\core\security.py` (PBKDF2-SHA256)

---

## Next Steps

1. ✅ Test login with both accounts
2. ✅ Create custom user account via registration
3. View dashboard with scan statistics
4. Create a new port scan
5. View scan results
6. Export results in JSON/CSV format

---

**Created**: 2026-05-25  
**System**: Windows 11  
**Framework**: FastAPI + React 18 + Vite + TypeScript
