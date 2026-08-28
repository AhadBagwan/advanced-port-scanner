# Enhanced Port Scanner - Comprehensive Development Prompt

## Project Overview
Build a production-ready TCP port scanner application with a modern web-based frontend, robust backend API, and advanced scanning capabilities. The application should provide real-time scanning progress, historical scan management, service detection, and detailed reporting.

---

## Phase 1: Core Features & Enhancements

### 1.1 Scanner Engine Improvements

#### Existing Features to Keep:
- Core TCP port scanning (ports 20-1024)
- Multi-threaded scanning with configurable workers
- Timeout handling
- Open port detection
- Host resolution

#### New Features to Add:

**1. Service Detection**
- Map detected ports to common services (HTTP, SSH, FTP, DNS, SMTP, POP3, IMAP, MySQL, PostgreSQL, etc.)
- Detect service versions where possible (banner grabbing for some protocols)
- Service database file (JSON) with port-to-service mappings
- Store service information in scan results

**2. Extended Port Range Scanning**
- Allow custom port ranges (default: 20-1024)
- Support for common port sets (Web: 80, 443, 8080; Database: 3306, 5432, 27017)
- Top 100/1000 well-known ports option
- Individual port scanning

**3. Rate Limiting & Network Safety**
- Configurable delay between port connections (default: 0ms)
- Bandwidth throttling option
- Request per second (RPS) limit
- Backoff strategy for network errors
- Max timeout enforcement (prevent hanging)

**4. Scanning Options**
- Stealth mode (slower, reduced detection risk)
- Aggressive mode (faster, higher resource usage)
- UDP port scanning (optional, with protocol selection)
- TCP SYN scan simulation (using socket library)
- Service version detection attempts

**5. Results Management**
- Store scan history in database
- Export results as JSON, CSV, PDF, XML
- Scan comparison (before/after)
- Trend analysis (port changes over time)
- Duplicate scan detection and warning

**6. Error Handling & Logging**
- Comprehensive error handling for network issues
- Detailed logging (DEBUG, INFO, WARNING, ERROR levels)
- Retry logic for transient failures
- Connection timeout vs. refused vs. filtered port differentiation

---

## Phase 2: Backend Architecture

### 2.1 Technology Stack (REQUIRED)

**Framework:** FastAPI (Python 3.10+)
- Asynchronous request handling
- Automatic OpenAPI/Swagger documentation
- Built-in request validation with Pydantic
- High performance, production-ready

**Database:** PostgreSQL 13+
- Relational data structure for scans, results, history
- JSONB support for flexible result storage
- Full-text search for scan results
- Time-series data capability

**Task Queue:** Celery + Redis
- Asynchronous scan execution (non-blocking API)
- Background job management
- Progress tracking via WebSocket
- Scan result persistence

**Authentication:** JWT (JSON Web Tokens)
- Stateless authentication
- Token refresh mechanism
- Role-based access control (RBAC: Admin, User, Viewer)

**ORM:** SQLAlchemy
- Database abstraction
- Model relationships
- Query optimization

### 2.2 Database Schema

```
Tables:
1. users
   - id (PK)
   - username (UNIQUE)
   - email (UNIQUE)
   - password_hash
   - role (enum: admin, user, viewer)
   - created_at
   - updated_at
   - is_active

2. scans
   - id (PK)
   - user_id (FK)
   - target_host
   - target_ip
   - status (enum: pending, running, completed, failed)
   - start_time
   - end_time
   - duration_seconds
   - port_range_start
   - port_range_end
   - timeout_seconds
   - workers_count
   - scan_type (enum: standard, stealth, aggressive, custom)
   - created_at
   - updated_at

3. scan_results
   - id (PK)
   - scan_id (FK)
   - port (INT)
   - is_open (BOOLEAN)
   - service_name
   - service_version
   - banner_info (TEXT)
   - response_time_ms
   - protocol (enum: TCP, UDP)

4. scan_tags
   - id (PK)
   - scan_id (FK)
   - tag (VARCHAR)
   - for filtering and organization

5. audit_logs
   - id (PK)
   - user_id (FK)
   - action
   - resource_type
   - resource_id
   - timestamp
   - for security and compliance
```

### 2.3 API Endpoints (RESTful with JSON)

**Authentication Endpoints:**
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login (returns JWT token)
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/logout            - Logout (invalidate token)
GET    /api/auth/me                - Get current user info
```

**Scan Management Endpoints:**
```
POST   /api/scans                  - Create and start new scan
GET    /api/scans                  - List user's scans (paginated)
GET    /api/scans/{scan_id}        - Get scan details
GET    /api/scans/{scan_id}/results - Get scan results (paginated, filterable)
GET    /api/scans/{scan_id}/progress - Real-time scan progress (EventStream/WebSocket)
PUT    /api/scans/{scan_id}        - Update scan tags/notes
DELETE /api/scans/{scan_id}        - Delete scan
POST   /api/scans/{scan_id}/export - Export scan results (format: json, csv, pdf, xml)
```

**Service Database Endpoints:**
```
GET    /api/services               - Get all known services
GET    /api/services/{port}        - Get service info for port
POST   /api/services               - Admin: add/update service (Admin only)
```

**Statistics Endpoints:**
```
GET    /api/stats/summary          - User scan summary stats
GET    /api/stats/trends           - Scan trends over time
GET    /api/scans/compare          - Compare two scan results
```

**Admin Endpoints:**
```
GET    /api/admin/users            - List all users (Admin only)
PUT    /api/admin/users/{user_id}  - Modify user role (Admin only)
DELETE /api/admin/users/{user_id}  - Delete user (Admin only)
GET    /api/admin/audit-logs       - View audit logs (Admin only)
GET    /api/admin/system-stats     - System performance stats (Admin only)
```

**Request Body Examples:**

Create Scan:
```json
{
  "target": "example.com",
  "port_range_start": 20,
  "port_range_end": 1024,
  "scan_type": "standard",
  "timeout": 0.5,
  "max_workers": 200,
  "enable_service_detection": true,
  "enable_banner_grabbing": false,
  "tags": ["production", "compliance-check"]
}
```

**Response Format (Standardized):**
```json
{
  "status": "success",
  "data": { /* actual data */ },
  "error": null,
  "timestamp": "2026-05-25T14:57:38Z",
  "request_id": "uuid"
}
```

### 2.4 WebSocket Implementation
- Real-time scan progress updates
- Port-by-port results streaming
- Connection: `/ws/scans/{scan_id}/progress?token=jwt_token`
- Message format:
```json
{
  "event": "port_scanned",
  "port": 80,
  "is_open": true,
  "service": "HTTP",
  "progress_percent": 45
}
```

### 2.5 Security Requirements

**Must Implement:**
- JWT token validation on all protected endpoints
- CORS policy (restrict to frontend origin)
- Rate limiting per user (100 requests/minute baseline)
- SQL injection prevention (SQLAlchemy parameterized queries)
- HTTPS enforcement in production
- Request size limits
- Input validation for all endpoints
- Audit logging for all admin actions
- OWASP Top 10 compliance

**Must NOT Implement:**
- Session-based authentication (use JWT only)
- API keys in URL query parameters (use Authorization header)
- Password storage in plaintext
- Hardcoded secrets in code
- Unrestricted CORS (Access-Control-Allow-Origin: *)

### 2.6 Backend File Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py               # Configuration, environment variables
│   ├── dependencies.py         # Shared dependencies (auth, db session)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── scan.py
│   │   ├── scan_result.py
│   │   └── audit_log.py
│   ├── schemas/                # Pydantic models for request/response
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── scan.py
│   │   └── common.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── scans.py
│   │   ├── services.py
│   │   ├── stats.py
│   │   └── admin.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py         # JWT, password hashing
│   │   ├── scanner.py          # Port scanning logic
│   │   └── service_detector.py # Service detection
│   ├── database/
│   │   ├── __init__.py
│   │   ├── session.py          # DB session management
│   │   └── migrations/         # Alembic migrations
│   ├── services/
│   │   ├── __init__.py
│   │   ├── scan_service.py     # Business logic
│   │   ├── user_service.py
│   │   └── export_service.py
│   ├── tasks/
│   │   ├── __init__.py
│   │   └── scanning.py         # Celery tasks
│   └── utils/
│       ├── __init__.py
│       ├── logger.py
│       └── exceptions.py
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_scans.py
│   └── test_scanner.py
├── requirements.txt
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Phase 3: Frontend Architecture

### 3.1 Technology Stack (REQUIRED)

**Framework:** React 18+ (with TypeScript)
- Component-based architecture
- State management with Redux Toolkit or Zustand
- Modern hooks-based approach

**UI Library:** Material-UI (MUI) v5+
- Professional component library
- Consistent design system
- Dark/Light theme support built-in
- Accessibility (WCAG 2.1 AA compliance)

**HTTP Client:** Axios or Fetch API with custom wrapper
- Request/response interceptors
- Automatic JWT token injection
- Request/response logging

**Real-time Updates:** WebSocket via socket.io-client
- Real-time scan progress
- Live port updates
- Automatic reconnection

**Charting:** Recharts or Chart.js
- Visualize scan results
- Trend analysis charts
- Performance metrics

**Routing:** React Router v6+
- Protected routes
- Role-based navigation
- Breadcrumb navigation

**Form Handling:** React Hook Form + Zod validation
- Efficient form state management
- Client-side validation

**Testing:** Vitest + React Testing Library
- Component unit tests
- Integration tests
- E2E tests with Playwright

### 3.2 Pages & Components

**Public Pages:**
- Landing page (features, how it works)
- Login page
- Registration page

**Authenticated Pages:**

1. **Dashboard**
   - Welcome message with user name
   - Recent scans list (5 latest)
   - Quick statistics (total scans, ports found, etc.)
   - Links to create new scan or view history
   - System health status

2. **Create New Scan**
   - Target hostname/IP input with validation
   - Port range selector (presets + custom)
   - Scan type selection (Standard, Stealth, Aggressive)
   - Advanced options toggle:
     - Timeout (slider: 0.1-5 seconds)
     - Worker threads (slider: 10-500)
     - Service detection checkbox
     - Banner grabbing checkbox
   - Tags input (auto-complete from history)
   - Save as template checkbox
   - "Start Scan" button (disabled until valid)
   - "Clear" button to reset form

3. **Scan Progress Page**
   - Target info (IP, hostname, port range)
   - Live progress bar (percentage + time estimate)
   - Real-time port table:
     - Port number
     - Status (Open/Closed/Filtered)
     - Service name
     - Response time
     - Sortable, filterable columns
   - Pause/Resume buttons
   - Cancel button (with confirmation)
   - Live stats sidebar (ports checked, open found, time elapsed)
   - Collapsible network log (detailed connection info)

4. **Scan Results Page**
   - Tabs: Overview, Detailed Results, Analysis, Timeline
   - **Overview Tab:**
     - Scan metadata (date, duration, target)
     - Open ports summary (count, list)
     - Services detected (pie chart)
     - Top ports chart
   - **Detailed Results Tab:**
     - Filterable table: Port, Service, Version, Response Time
     - Export buttons (JSON, CSV, PDF, XML)
     - Copy port list button
   - **Analysis Tab:**
     - Service distribution chart
     - Response time analysis
     - Port grouping by service category
   - **Timeline Tab:**
     - Ports discovered timeline
     - Discovery speed visualization

5. **Scan History Page**
   - Searchable, filterable table:
     - Target (hostname + IP)
     - Date/Time
     - Ports checked
     - Open ports count
     - Scan duration
     - Actions (View, Compare, Delete, Re-scan)
   - Pagination (25, 50, 100 per page)
   - Sorting (date, target, open ports)
   - Tag filtering
   - Bulk actions (Delete multiple, Export multiple)
   - Quick preview modal on row click

6. **Compare Scans Page**
   - Select two scans to compare
   - Side-by-side view:
     - New ports found
     - Ports that closed
     - Ports that remain open
     - Service changes
   - Visualization: Venn diagram or comparison chart
   - Export comparison report

7. **Settings Page**
   - **Profile Section:**
     - Display name edit
     - Email address
     - Change password form
   - **Preferences:**
     - Theme toggle (Light/Dark)
     - Pagination size preference
     - Default timeout value
     - Default worker count
     - Notifications toggle
   - **API Tokens:**
     - View existing tokens
     - Generate new token
     - Revoke token
   - **Security:**
     - Active sessions list
     - Logout all sessions button
     - Login history (last 10 sessions)

8. **Admin Panel** (Admin only)
   - User management:
     - List all users with role, status, created date
     - Search, filter, sort users
     - Bulk role change
     - Deactivate/Delete user
   - System statistics:
     - Total scans performed
     - Most scanned targets
     - Popular services
     - API usage trends
   - Audit logs:
     - Filter by action, user, resource
     - Date range picker
     - Export audit trail
   - Service database:
     - View/Edit known services
     - Add custom services
     - Port-service mappings

### 3.3 UI Components (Reusable)

**Common Components:**
- Header with navigation, user menu, notifications
- Sidebar (collapsed on mobile)
- Footer
- Loading spinner
- Empty state component
- Error boundary
- Modal dialogs
- Toast notifications (success, error, info, warning)
- Breadcrumb navigation
- Pagination component
- Data table with sorting/filtering
- Form inputs (text, select, checkbox, slider)
- Progress bar
- Charts (bar, pie, line)
- Status badge (Open, Closed, Filtered)
- Copy-to-clipboard button
- Download button
- Filter panel
- Search box

### 3.4 Frontend File Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── Common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── Scans/
│   │   │   ├── ScanForm.tsx
│   │   │   ├── ScanProgress.tsx
│   │   │   ├── ScanResults.tsx
│   │   │   ├── ScanHistory.tsx
│   │   │   └── ScanComparison.tsx
│   │   └── Admin/
│   │       ├── UserManagement.tsx
│   │       ├── SystemStats.tsx
│   │       └── AuditLogs.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── CreateScan.tsx
│   │   ├── ScanProgress.tsx
│   │   ├── ScanResults.tsx
│   │   ├── History.tsx
│   │   ├── CompareScan.tsx
│   │   ├── Settings.tsx
│   │   ├── AdminPanel.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── NotFound.tsx
│   ├── store/
│   │   ├── auth.ts          # Redux slice or Zustand store
│   │   ├── scans.ts
│   │   ├── ui.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useScan.ts
│   │   ├── useWebSocket.ts
│   │   └── useLocalStorage.ts
│   ├── services/
│   │   ├── api.ts           # Axios instance with interceptors
│   │   ├── authService.ts
│   │   ├── scanService.ts
│   │   └── websocketService.ts
│   ├── types/
│   │   ├── index.ts         # TypeScript interfaces
│   │   ├── api.ts
│   │   └── scan.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── styles/
│   │   ├── theme.ts
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── components/
│   ├── pages/
│   └── utils/
├── public/
│   └── (static assets)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 3.5 User Experience Requirements

**Design Principles:**
- Mobile-first responsive design (Works on mobile, tablet, desktop)
- Accessibility first (WCAG 2.1 AA compliant)
- Fast load times (<2 seconds initial, <500ms interactions)
- Intuitive navigation
- Clear error messages with solutions
- Confirmation dialogs for destructive actions
- Keyboard shortcuts for power users (? for help)

**Performance:**
- Code splitting for routes
- Lazy loading images
- CSS-in-JS with efficient rendering
- Debounced search/filter inputs
- Virtual scrolling for large lists
- Service worker for offline capability (optional)

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard navigation support
- Color contrast ratio 4.5:1 for text
- Focus indicators visible
- Screen reader friendly
- Error messages linked to form fields

---

## Phase 4: DevOps & Deployment

### 4.1 Containerization

**Docker Configuration:**

```dockerfile
# Backend Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose:**
- Backend service (FastAPI)
- Frontend service (Nginx)
- PostgreSQL database
- Redis (for Celery)
- Celery worker
- Nginx reverse proxy
- Volume management
- Network configuration

### 4.2 CI/CD Pipeline (GitHub Actions)

**Workflows:**
- Run tests on PR
- Build Docker images
- Security scanning (SAST, dependency check)
- Deploy to staging on merge to main
- Manual approval for production deploy

### 4.3 Environment Configuration

**Must Use:**
- Environment variables for all configuration (database URL, JWT secret, etc.)
- .env file for local development (git-ignored)
- .env.example as template
- Different configs for dev, staging, production

**Must NOT Use:**
- Hardcoded credentials
- Config files in version control
- Default passwords

---

## Phase 5: Testing Strategy

### 5.1 Backend Tests

**Unit Tests:**
- Scanner functions (is_port_open, service detection)
- Service mapper
- Input validators
- Security functions (JWT creation/validation, password hashing)

**Integration Tests:**
- API endpoints (all CRUD operations)
- Database interactions
- Auth flow (login, token refresh, logout)
- WebSocket connections

**Test Framework:** pytest with pytest-asyncio, pytest-cov
**Coverage Target:** ≥80%

### 5.2 Frontend Tests

**Unit Tests:**
- Components in isolation
- Utility functions
- Store/state management
- Hooks

**Integration Tests:**
- Component interactions
- Page workflows
- Form submissions
- API integration

**E2E Tests:** Playwright
- User registration
- User login
- Create scan
- View results
- Compare scans

**Test Framework:** Vitest + React Testing Library
**Coverage Target:** ≥75%

---

## Phase 6: Documentation

**Required Documentation:**
1. **Backend API Documentation**
   - Auto-generated from FastAPI (Swagger/OpenAPI)
   - Endpoint specifications
   - Authentication guide
   - Error codes reference
   - Rate limiting details

2. **Frontend Documentation**
   - Component library guide
   - State management flow
   - WebSocket implementation details
   - Development setup guide

3. **Database Schema Documentation**
   - ER diagram
   - Table descriptions
   - Relationship explanations

4. **Deployment Guide**
   - Prerequisites
   - Step-by-step setup
   - Environment configuration
   - Database migrations
   - Health checks

5. **User Guide**
   - Getting started
   - Creating first scan
   - Understanding results
   - Comparing scans
   - Exporting data

6. **Developer Guide**
   - Local development setup
   - Running tests
   - Contributing guidelines
   - Code style guide
   - Architecture decisions (ADR)

---

## Technology Stack Summary

### DO USE:
- **Backend:** FastAPI, PostgreSQL, SQLAlchemy, Celery, Redis, JWT, Pydantic
- **Frontend:** React 18+, TypeScript, Material-UI, Axios, React Router v6, Zod
- **DevOps:** Docker, Docker Compose, GitHub Actions, Nginx
- **Testing:** pytest, Vitest, React Testing Library, Playwright
- **Monitoring:** Structured logging, sentry.io for error tracking

### DO NOT USE:
- Flask (too lightweight for this project)
- MongoDB (relational data is better for scans)
- Session-based auth (JWT only)
- Vue.js or Angular (React ecosystem preferred)
- Bootstrap (use Material-UI for professional appearance)
- Firebase (maintain full control with PostgreSQL)
- No-code solutions (proper code required)
- Unencrypted passwords
- API keys in URLs
- Global state management (use Redux Toolkit or Zustand)
- Inline styles (use CSS-in-JS or Tailwind)
- Callbacks for async (use async/await)

---

## Feature Priority & Roadmap

### MVP (Phase 1-2):
1. ✅ Basic TCP port scanning (existing)
2. ✅ Multi-threaded execution (existing)
3. 🔄 FastAPI backend with PostgreSQL
4. 🔄 React frontend with basic scanning UI
5. 🔄 User authentication (JWT)
6. 🔄 Scan history storage
7. 🔄 Service detection (common ports only)
8. 🔄 Export to JSON/CSV

### Phase 2 (Enhanced):
9. 🔄 WebSocket real-time progress
10. 🔄 Advanced scanning modes (Stealth, Aggressive)
11. 🔄 Scan comparison feature
12. 🔄 Admin panel
13. 🔄 Detailed analytics/charts
14. 🔄 Audit logging

### Phase 3 (Polish & Deploy):
15. 🔄 Performance optimization
16. 🔄 Mobile responsiveness
17. 🔄 Full test coverage
18. 🔄 Docker containerization
19. 🔄 Production deployment
20. 🔄 Security hardening
21. 🔄 Complete documentation

---

## Security Checklist

- [ ] HTTPS/TLS in production
- [ ] CORS properly configured (specific origins)
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React automatically escapes)
- [ ] CSRF tokens if needed
- [ ] JWT token expiration (15-30 minutes)
- [ ] Refresh token rotation
- [ ] Password hashing (bcrypt or argon2)
- [ ] Input validation on all endpoints
- [ ] Output encoding
- [ ] Sensitive data not in logs
- [ ] Secrets in environment variables
- [ ] Database backups
- [ ] Audit logging
- [ ] Dependency scanning (Snyk, Dependabot)
- [ ] Security headers (CSP, X-Frame-Options, etc.)

---

## Performance Targets

- **Backend API:** <200ms response time (p99)
- **Frontend:** First Contentful Paint <2s, Interaction to Paint <500ms
- **Database Queries:** <100ms for filtered lists
- **WebSocket Updates:** <50ms latency
- **Scan Speed:** 1000 ports in <60 seconds with 200 workers
- **Memory Usage:** Backend <500MB, Frontend <100MB

---

## Success Criteria

1. ✅ Scan results match original Python scanner for accuracy
2. ✅ Web UI provides better UX than CLI
3. ✅ Scan history persists and is queryable
4. ✅ Real-time progress updates via WebSocket
5. ✅ User authentication and authorization working
6. ✅ Results exportable in multiple formats
7. ✅ Mobile responsive design
8. ✅ >80% test coverage
9. ✅ Deployable via Docker
10. ✅ Meets security requirements
11. ✅ Comprehensive documentation
12. ✅ Performance targets met

---

## Getting Started Command

```bash
# Create project structure
mkdir -p port-scanner/{backend,frontend}

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary celery redis pydantic python-jose bcrypt
# ... (full requirements.txt)

# Frontend setup
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install @mui/material @emotion/react @emotion/styled axios react-router-dom zustand
# ... (full dependencies)

# Database
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:13
docker run --name redis -p 6379:6379 -d redis:latest
```

---

## Final Notes

This prompt provides a comprehensive specification for transforming your Python CLI port scanner into a production-ready web application. Follow the architecture and best practices outlined above to build a scalable, secure, and user-friendly port scanning platform.

**Estimated Timeline:** 
- MVP (Backend + Basic Frontend): 3-4 weeks
- Full Feature Set: 6-8 weeks
- Polish + Deployment: 2-3 weeks
- Total: 10-15 weeks for one developer

**Team Recommendation:** 
- 1 Backend Developer (FastAPI, PostgreSQL)
- 1 Frontend Developer (React, TypeScript)
- 1 DevOps Engineer (Docker, CI/CD)
