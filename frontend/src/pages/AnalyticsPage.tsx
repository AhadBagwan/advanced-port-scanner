import React from 'react'
import { Container, Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

export const AnalyticsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const isDarkMode = useUiStore((state) => state.theme === 'dark')
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  const statusData = [
    { name: 'Completed', value: 8, fill: '#16a34a' },
    { name: 'Running', value: 1, fill: '#d97706' },
    { name: 'Failed', value: 1, fill: '#dc2626' },
  ]

  const vulnerabilityRiskData = [
    { name: 'Critical Risk', value: 3, fill: '#ff4d4f' },
    { name: 'High Risk', value: 5, fill: '#ff7a45' },
    { name: 'Medium Risk', value: 8, fill: '#ffc53d' },
    { name: 'Low Risk', value: 12, fill: '#73d13d' },
    { name: 'Info / Safe', value: 24, fill: '#597ef7' },
  ]

  const portsData = [
    { target: '10.0.0.5', ports: 6, status: 'High' },
    { target: 'api.example.com', ports: 5, status: 'High' },
    { target: '192.168.1.1', ports: 4, status: 'Medium' },
    { target: 'monitor.local', ports: 4, status: 'Medium' },
    { target: 'google.com', ports: 3, status: 'Low' },
  ]

  const timelineData = [
    { time: '00:30', scans: 2, ports: 5 },
    { time: '01:00', scans: 1, ports: 3 },
    { time: '02:00', scans: 1, ports: 4 },
    { time: '03:30', scans: 1, ports: 8 },
    { time: '04:45', scans: 1, ports: 5 },
    { time: '06:10', scans: 1, ports: 5 },
    { time: '07:20', scans: 1, ports: 2 },
    { time: '08:45', scans: 1, ports: 6 },
    { time: '09:15', scans: 1, ports: 3 },
    { time: '10:30', scans: 1, ports: 4 },
  ]

  const stats = [
    { label: 'Total Scans', value: '10', color: isDarkMode ? '#00d9ff' : '#0284c7' },
    { label: 'Success Rate', value: '80%', color: '#16a34a' },
    { label: 'Threat Index', value: 'Medium Risk', color: '#d97706' },
    { label: 'Total Ports Scanned', value: '10,050', color: '#7c3aed' },
  ]

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: isDarkMode ? '#05070a' : '#e2e8f0', color: isDarkMode ? '#e6edf3' : '#0f172a', transition: 'background-color 0.3s ease' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.2, fontFamily: "'Share Tech Mono', monospace", color: isDarkMode ? '#00d9ff' : '#0284c7' }}>
            CYBER RADAR
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: isDarkMode ? '#00ff88' : '#16a34a', letterSpacing: '1.5px' }}>
            ADVANCED PORT SCANNER ANALYTICS
          </Typography>
          <Typography variant="body2" color={isDarkMode ? '#8b949e' : '#475569'} sx={{ mt: 0.5 }}>
            Comprehensive security posture insights, vulnerability risk distribution, and historical trends
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #cbd5e1', borderRadius: 2, transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#8b949e' : '#475569', display: 'block', mb: 1, fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {stat.label.toUpperCase()}
                  </Typography>
                  <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold', fontFamily: "'Share Tech Mono', monospace" }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          {/* Status Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #cbd5e1', borderRadius: 2.5, transition: 'all 0.3s ease', '&:hover': { boxShadow: isDarkMode ? '0 0 20px rgba(0,217,255,0.2)' : '0 10px 25px rgba(0,0,0,0.08)' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: "'Share Tech Mono', monospace", color: isDarkMode ? '#00d9ff' : '#0284c7' }}>
                📈 Scan Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0d1117' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #cbd5e1', color: isDarkMode ? '#c9d1d9' : '#0f172a' }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Vulnerability Severity Breakdown */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #cbd5e1', borderRadius: 2.5, transition: 'all 0.3s ease', '&:hover': { boxShadow: isDarkMode ? '0 0 20px rgba(0,217,255,0.2)' : '0 10px 25px rgba(0,0,0,0.08)' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: "'Share Tech Mono', monospace", color: isDarkMode ? '#00d9ff' : '#0284c7' }}>
                🛡️ Vulnerability Risk Ratings
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vulnerabilityRiskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {vulnerabilityRiskData.map((entry, index) => (
                      <Cell key={`cell-vuln-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0d1117' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #cbd5e1', color: isDarkMode ? '#c9d1d9' : '#0f172a' }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Targets */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #cbd5e1', borderRadius: 2.5, transition: 'all 0.3s ease', '&:hover': { boxShadow: isDarkMode ? '0 0 20px rgba(0,217,255,0.2)' : '0 10px 25px rgba(0,0,0,0.08)' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: "'Share Tech Mono', monospace", color: isDarkMode ? '#00d9ff' : '#0284c7' }}>
                🎯 Top Targets by Open Ports
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#30363d' : '#e2e8f0'} />
                  <XAxis dataKey="target" tick={{ fill: isDarkMode ? '#8b949e' : '#475569', fontSize: 12 }} />
                  <YAxis tick={{ fill: isDarkMode ? '#8b949e' : '#475569', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0d1117' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #cbd5e1', color: isDarkMode ? '#c9d1d9' : '#0f172a' }} />
                  <Bar dataKey="ports" fill={isDarkMode ? '#00d9ff' : '#0284c7'} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Timeline */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #cbd5e1', borderRadius: 2.5, transition: 'all 0.3s ease', '&:hover': { boxShadow: isDarkMode ? '0 0 20px rgba(0,217,255,0.2)' : '0 10px 25px rgba(0,0,0,0.08)' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: "'Share Tech Mono', monospace", color: isDarkMode ? '#00d9ff' : '#0284c7' }}>
                📅 Scanning Activity Timeline
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#30363d' : '#e2e8f0'} />
                  <XAxis dataKey="time" tick={{ fill: isDarkMode ? '#8b949e' : '#475569', fontSize: 12 }} />
                  <YAxis tick={{ fill: isDarkMode ? '#8b949e' : '#475569', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0d1117' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #cbd5e1', color: isDarkMode ? '#c9d1d9' : '#0f172a' }} />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#c9d1d9' : '#0f172a' }} />
                  <Line type="monotone" dataKey="scans" stroke={isDarkMode ? '#00d9ff' : '#0284c7'} strokeWidth={2} dot={{ fill: isDarkMode ? '#00d9ff' : '#0284c7' }} />
                  <Line type="monotone" dataKey="ports" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a' }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
