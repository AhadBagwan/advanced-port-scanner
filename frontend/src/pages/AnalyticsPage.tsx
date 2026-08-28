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

export const AnalyticsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  // Chart data
  const statusData = [
    { name: 'Completed', value: 8, fill: '#3fb950' },
    { name: 'Running', value: 1, fill: '#d29922' },
    { name: 'Failed', value: 1, fill: '#f85149' },
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
    { label: 'Total Scans', value: '10', color: '#58a6ff' },
    { label: 'Success Rate', value: '80%', color: '#3fb950' },
    { label: 'Threat Index', value: 'Medium Risk', color: '#ffc53d' },
    { label: 'Total Ports Scanned', value: '10,050', color: '#667eea' },
  ]

  return (
    <Box sx={{ py: 3, minHeight: '100vh', bgcolor: '#0d1117', color: '#c9d1d9' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            📊 Analytics & Threat Intelligence Reports
          </Typography>
          <Typography variant="body2" color="#8b949e">
            Comprehensive security posture insights, vulnerability risk distribution, and historical trends
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ bgcolor: '#161b22', border: '1px solid #30363d' }}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="caption" sx={{ color: '#8b949e', display: 'block', mb: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>
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
            <Paper sx={{ p: 3, bgcolor: '#161b22', border: '1px solid #30363d' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
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
                  <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9' }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Vulnerability Severity Breakdown */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: '#161b22', border: '1px solid #30363d' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                🛡️ Discovered Vulnerability Risk Ratings
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
                  <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9' }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Targets */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: '#161b22', border: '1px solid #30363d' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                🎯 Top Targets by Open Ports
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="target" tick={{ fill: '#8b949e', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9' }} />
                  <Bar dataKey="ports" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Timeline */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: '#161b22', border: '1px solid #30363d' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                📅 Scanning Activity Timeline
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="time" tick={{ fill: '#8b949e', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9' }} />
                  <Legend wrapperStyle={{ color: '#c9d1d9' }} />
                  <Line type="monotone" dataKey="scans" stroke="#58a6ff" strokeWidth={2} dot={{ fill: '#58a6ff' }} />
                  <Line type="monotone" dataKey="ports" stroke="#3fb950" strokeWidth={2} dot={{ fill: '#3fb950' }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
