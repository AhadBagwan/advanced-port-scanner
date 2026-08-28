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
        border: isDarkMode ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid #cbd5e1',
        bg: isDarkMode ? 'rgba(22, 27, 34, 0.85)' : '#ffffff',
      },
      {
        label: 'Completed Jobs',
        value: stats.completedScans,
        icon: <Shield />,
        color: isDarkMode ? '#00ff88' : '#16a34a',
        border: isDarkMode ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid #cbd5e1',
        bg: isDarkMode ? 'rgba(22, 27, 34, 0.85)' : '#ffffff',
      },
      {
        label: 'Open Ports Detected',
        value: stats.totalOpenPorts,
        icon: <Radar />,
        color: isDarkMode ? '#ff4d4d' : '#dc2626',
        border: isDarkMode ? '1px solid rgba(255, 77, 77, 0.3)' : '1px solid #cbd5e1',
        bg: isDarkMode ? 'rgba(22, 27, 34, 0.85)' : '#ffffff',
      },
      {
        label: 'Avg Duration',
        value: `${stats.avgScanDuration}s`,
        icon: <Zap />,
        color: isDarkMode ? '#ffb020' : '#d97706',
        border: isDarkMode ? '1px solid rgba(255, 176, 32, 0.3)' : '1px solid #cbd5e1',
        bg: isDarkMode ? 'rgba(22, 27, 34, 0.85)' : '#ffffff',
      },
    ],
    [stats, isDarkMode]
  )

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: isDarkMode ? '#05070a' : '#e2e8f0', color: isDarkMode ? '#e6edf3' : '#0f172a', transition: 'background-color 0.3s ease' }}>
      <Container maxWidth="lg">
        {/* Hero Banner with Logo & Subtitle */}
        <Paper
          sx={{
            p: { xs: 2.5, md: 4 },
            mb: 4,
            bgcolor: isDarkMode ? 'rgba(18, 22, 29, 0.85)' : '#ffffff',
            backdropFilter: 'blur(12px)',
            border: isDarkMode ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid #cbd5e1',
            boxShadow: isDarkMode ? '0 0 30px rgba(0, 217, 255, 0.15)' : '0 10px 30px rgba(0, 0, 0, 0.06)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: isDarkMode ? '0 0 40px rgba(0, 217, 255, 0.25)' : '0 15px 35px rgba(0, 0, 0, 0.1)',
            },
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
                    width: { xs: 55, sm: 70 },
                    height: { xs: 55, sm: 70 },
                    borderRadius: '50%',
                    border: '3px solid #00d9ff',
                    boxShadow: '0 0 25px rgba(0, 217, 255, 0.8)',
                    transition: 'transform 0.4s ease',
                    '&:hover': {
                      transform: 'scale(1.1) rotate(10deg)',
                    },
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
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    CYBER RADAR
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: isDarkMode ? '#00d9ff' : '#0284c7',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      letterSpacing: '2px',
                      fontSize: { xs: '0.85rem', sm: '1rem' },
                    }}
                  >
                    ADVANCED PORT SCANNER SYSTEM
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#8b949e' : '#475569', fontSize: '0.85rem', mt: 0.5 }}>
                    Real-Time Network Reconnaissance & Threat Intelligence Engine
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
                  borderRadius: 2,
                  boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 100%)',
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(0, 255, 136, 0.5)',
                  },
                }}
              >
                LAUNCH NEW SCAN
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Grid with Hover Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statsCards.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card
                sx={{
                  bgcolor: stat.bg,
                  border: stat.border,
                  borderRadius: 2.5,
                  boxShadow: isDarkMode ? `0 0 15px ${stat.color}15` : '0 4px 15px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: isDarkMode ? `0 10px 30px ${stat.color}40` : '0 10px 25px rgba(0, 0, 0, 0.12)',
                    borderColor: stat.color,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#8b949e' : '#475569', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace' }}>
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
            bgcolor: isDarkMode ? 'rgba(22, 27, 34, 0.85)' : '#ffffff',
            border: isDarkMode ? '1px solid rgba(0, 217, 255, 0.2)' : '1px solid #cbd5e1',
            boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 25px rgba(0, 0, 0, 0.06)',
            borderRadius: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: "'Share Tech Mono', monospace", color: isDarkMode ? '#00d9ff' : '#0284c7', letterSpacing: '1px' }}>
                📡 RECENT RECON SCANS
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchDashboard}
                sx={{
                  color: isDarkMode ? '#8b949e' : '#475569',
                  borderColor: isDarkMode ? '#30363d' : '#cbd5e1',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: isDarkMode ? '#21262d' : '#f1f5f9',
                    transform: 'rotate(180deg)',
                  },
                }}
              >
                Refresh
              </Button>
              <Button
                size="small"
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/scans')}
                sx={{
                  bgcolor: isDarkMode ? '#161b22' : '#0284c7',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: isDarkMode ? '#21262d' : '#0369a1',
                    transform: 'translateX(3px)',
                  },
                }}
              >
                View All Scans
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
                  <TableRow sx={{ '& th': { bgcolor: isDarkMode ? '#0d1117' : '#e2e8f0', color: isDarkMode ? '#8b949e' : '#0f172a', fontWeight: 'bold', fontFamily: 'monospace' } }}>
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
                      <TableCell colSpan={5} sx={{ textAlign: 'center', color: isDarkMode ? '#8b949e' : '#475569', py: 3 }}>
                        No scan history found. Launch your first scan above!
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentScans.map((scan) => (
                      <TableRow
                        key={scan.id}
                        sx={{
                          borderBottom: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(0, 217, 255, 0.08)' : 'rgba(2, 132, 199, 0.08)',
                            cursor: 'pointer',
                          },
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: isDarkMode ? '#00d9ff' : '#0284c7' }}>{scan.target_host}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {scan.port_range_start}-{scan.port_range_end}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={scan.status.toUpperCase()} color={statusColor(scan.status) as any} variant="outlined" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: scan.open_ports_count > 0 ? (isDarkMode ? '#00ff88' : '#16a34a') : (isDarkMode ? '#8b949e' : '#475569') }}>
                          {scan.open_ports_count} ports
                        </TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#8b949e' : '#475569', fontSize: '0.85rem' }}>{new Date(scan.created_at).toLocaleString()}</TableCell>
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
