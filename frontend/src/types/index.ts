// API Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user?: User
}

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Scan Types
export interface ScanCreateRequest {
  target: string
  port_range_start: number
  port_range_end: number
  preset_profile?: 'web' | 'database' | 'remote_management' | 'top100' | 'custom'
  scan_type: 'standard' | 'stealth' | 'aggressive'
  timeout: number
  max_workers: number
  enable_service_detection: boolean
  enable_banner_grabbing: boolean
  tags: string[]
  notes?: string
}

export interface ScanResult {
  id: number
  port: number
  is_open: boolean
  service_name?: string
  service_version?: string
  response_time_ms?: number
  protocol: 'TCP' | 'UDP'
  risk_level?: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'
  vulnerability_description?: string
  recommendation?: string
}

export interface Scan {
  id: number
  target_host: string
  target_ip: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  port_range_start: number
  port_range_end: number
  open_ports_count: number
  duration_seconds?: number
  timeout_seconds?: number
  workers_count?: number
  scan_type?: string
  enable_service_detection?: boolean
  enable_banner_grabbing?: boolean
  start_time?: string
  end_time?: string
  notes?: string
  results?: ScanResult[]
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface ScanDiffPort {
  port: number
  service_name?: string
  status_scan1?: 'open' | 'closed'
  status_scan2?: 'open' | 'closed'
  change_type: 'added' | 'removed' | 'modified' | 'unchanged'
}

export interface ScanComparisonData {
  scan1: Scan
  scan2: Scan
  added_ports: number[]
  removed_ports: number[]
  common_ports: number[]
  details: ScanDiffPort[]
}

// Statistics Types
export interface SummaryStats {
  scans: {
    total: number
    completed: number
    running: number
    failed: number
  }
  ports: {
    total_scanned: number
    open_found: number
    open_percentage: number
  }
  averages: {
    scan_duration_seconds: number
    open_ports_per_scan: number
  }
}

export interface TrendData {
  date: string
  scan_count: number
  total_open_ports: number
}

export interface TopTarget {
  target_host: string
  target_ip: string
  scan_count: number
  total_open_ports: number
}

// Utility Types
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
  pages: number
}

export interface APIResponse<T> {
  status: 'success' | 'error'
  data: T
  message?: string
  timestamp?: string
  error?: string
}
