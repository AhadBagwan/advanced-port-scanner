import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material'
import { Radar, Shield, Speed as Activity, FlashOn as Zap, Refresh, Add, ArrowForward } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { scanService } from '@/services/scanService'
import apiClient from '@/services/api'
import type { Scan } from '@/types'

interface DashboardStats {
  totalScans: number
  completedScans: number
  totalOpenPorts: number
  totalPortsScanned: number
  avgScanDuration: number
}

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const isDarkMode = useUiStore((state) => state.theme === 'dark')
  const navigate = useNavigate()

  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    completedScans: 0,
    totalOpenPorts: 0,
    totalPortsScanned: 0,
    avgScanDuration: 0,
  })
  const [recentScans, setRecentScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchDashboard()
  }, [user, navigate])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const [statsRes, scansRes] = await Promise.all([
        apiClient.get('/stats').catch(() => ({ data: {} })),
        scanService.listScans(0, 10).catch(() => ({ items: [] })),
      ])

      const rawStats = statsRes.data?.data || statsRes.data || {}
      setStats({
        totalScans: rawStats.total_scans || (scansRes.items ? scansRes.items.length : 0),
        completedScans: rawStats.completed_scans || (scansRes.items ? scansRes.items.filter((s: Scan) => s.status === 'completed').length : 0),
        totalOpenPorts: rawStats.total_open_ports || (scansRes.items ? scansRes.items.reduce((a: number, b: Scan) => a + b.open_ports_count, 0) : 0),
        totalPortsScanned: rawStats.total_ports_scanned || 1024,
        avgScanDuration: rawStats.avg_scan_duration || 4.5,
      })

      setRecentScans(scansRes.items || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'running':
        return 'warning'
      case 'pending':
        return 'info'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const statsCards = useMemo(
    () => [
      {
        label: 'Active Scans',
        value: stats.totalScans,
        icon: <Activity />,
        color: isDarkMode ? '#00d9ff' : '#0284c7',
        border: isDarkMode ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid #bae6fd',
        bg: isDarkMode ? 'rgba(22, 27, 34, 0.8)' : '#ffffff',
      },
      {
        label: 'Completed Jobs',
        value: stats.completedScans,
        icon: <Shield />,
        color: isDarkMode ? '#00ff88' : '#16a34a',
        border: isDarkMode ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid #bbf7d0',
        bg: isDarkMode ? 'rgba(22, 27, 34, 0.8)' : '#ffffff',
      },
      {
        label: 'Open Ports Detected',
        value: stats.totalOpenPorts,
        icon: <Radar />,
        color: isDarkMode ? '#ff4d4d' : '#dc2626',
        border: isDarkMode ? '1px solid rgba(255, 77, 77, 0.3)' : '1px solid #fecaca',
        bg: isDarkMode ? 'rgba(22, 27, 34, 0.8)' : '#ffffff',
      },
      {
        label: 'Avg Duration',
        value: `${stats.avgScanDuration}s`,
        icon: <Zap />,
        color: isDarkMode ? '#ffb020' : '#d97706',
        border: isDarkMode ? '1px solid rgba(255, 176, 32, 0.3)' : '1px solid #fef08a',
        bg: isDarkMode ? 'rgba(22, 27, 34, 0.8)' : '#ffffff',
      },
    ],
    [stats, isDarkMode]
  )

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: isDarkMode ? '#05070a' : '#f8fafc', color: isDarkMode ? '#e6edf3' : '#0f172a' }}>
      <Container maxWidth="lg">
        {/* Hero Cyber Banner with Logo */}
        <Paper
          sx={{
            p: { xs: 2.5, md: 4 },
            mb: 4,
            bgcolor: isDarkMode ? 'rgba(18, 22, 29, 0.7)' : '#ffffff',
            backdropFilter: 'blur(12px)',
            border: isDarkMode ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid #e2e8f0',
            boxShadow: isDarkMode ? '0 0 30px rgba(0, 217, 255, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                <Box
                  component="img"
                  src="/logo.jpg"
                  alt="Cyber Radar Logo"
                  sx={{
                    width: { xs: 50, sm: 70 },
                    height: { xs: 50, sm: 70 },
                    borderRadius: '50%',
                    border: '2px solid #00d9ff',
                    boxShadow: '0 0 25px rgba(0, 217, 255, 0.8)',
                  }}
                />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      fontFamily: "'Share Tech Mono', monospace",
                      background: 'linear-gradient(135deg, #00d9ff 0%, #667eea 50%, #00ff88 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '1px',
                      fontSize: { xs: '1.4rem', sm: '2rem' },
                    }}
                  >
                    CYBER RADAR RECON SYSTEM
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#8b949e' : '#475569', fontFamily: 'monospace', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    REAL-TIME THREAT INTELLIGENCE & PORT RECONNAISSANCE PLATFORM
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/scans')}
                fullWidth={{ xs: true, md: false } as any}
                sx={{
                  background: 'linear-gradient(135deg, #00d9ff 0%, #667eea 100%)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  py: 1.2,
                  px: 3,
                  fontSize: '0.95rem',
                  boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 100%)',
                  },
                }}
              >
                LAUNCH NEW SCAN
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Grid */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statsCards.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card
                sx={{
                  bgcolor: stat.bg,
                  border: stat.border,
                  boxShadow: isDarkMode ? `0 0 15px ${stat.color}15` : '0 2px 10px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDarkMode ? `0 0 25px ${stat.color}40` : '0 6px 16px rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace' }}>
                      {stat.label.toUpperCase()}
                    </Typography>
                    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  </Box>
                  <Typography variant="h4" sx={{ color: stat.color, fontWeight: 'bold', fontFamily: "'Share Tech Mono', monospace" }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Scans Table */}
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: isDarkMode ? 'rgba(22, 27, 34, 0.8)' : '#ffffff',
            border: isDarkMode ? '1px solid rgba(0, 217, 255, 0.2)' : '1px solid #e2e8f0',
            boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: "'Share Tech Mono', monospace", color: isDarkMode ? '#00d9ff' : '#0284c7', letterSpacing: '1px' }}>
              📡 RECENT RECON SCANS
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<Refresh />} onClick={fetchDashboard} sx={{ color: isDarkMode ? '#8b949e' : '#475569', borderColor: isDarkMode ? '#30363d' : '#cbd5e1' }}>
                Refresh
              </Button>
              <Button size="small" variant="contained" endIcon={<ArrowForward />} onClick={() => navigate('/scans')} sx={{ bgcolor: isDarkMode ? '#161b22' : '#0284c7', color: '#ffffff', '&:hover': { bgcolor: isDarkMode ? '#21262d' : '#0369a1' } }}>
                View All
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={32} sx={{ color: '#00d9ff' }} />
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: isDarkMode ? '#0d1117' : '#f8fafc', color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold', fontFamily: 'monospace' } }}>
                    <TableCell>TARGET HOST</TableCell>
                    <TableCell>PORT SCOPE</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell>OPEN PORTS</TableCell>
                    <TableCell>SCAN TIME</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentScans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', color: isDarkMode ? '#8b949e' : '#64748b', py: 3 }}>
                        No scan history found. Launch your first scan above!
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentScans.map((scan) => (
                      <TableRow key={scan.id} hover sx={{ '& td': { color: isDarkMode ? '#c9d1d9' : '#1e293b', borderColor: isDarkMode ? '#30363d' : '#e2e8f0' }, '&:hover': { bgcolor: isDarkMode ? '#0d1117' : '#f1f5f9' } }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: isDarkMode ? '#00d9ff' : '#0284c7' }}>{scan.target_host}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {scan.port_range_start}-{scan.port_range_end}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={scan.status.toUpperCase()} color={statusColor(scan.status) as any} variant="outlined" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: scan.open_ports_count > 0 ? (isDarkMode ? '#00ff88' : '#16a34a') : (isDarkMode ? '#8b949e' : '#64748b') }}>
                          {scan.open_ports_count} ports
                        </TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontSize: '0.85rem' }}>{new Date(scan.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  )
}
