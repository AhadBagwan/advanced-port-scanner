import React, { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Search,
  Download,
  Delete,
  Visibility,
  Close,
  Refresh,
  Compare,
  Add,
  Shield,
  PictureAsPdf,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { scanService } from '@/services/scanService'
import { ScanComparisonModal } from '@/components/ScanComparisonModal'
import type { Scan, ScanResult } from '@/types'

interface FilterOptions {
  status: string
  searchTerm: string
  minPorts: string
  maxPorts: string
}

export const ScansPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const isDarkMode = useUiStore((state) => state.theme === 'dark')
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [openDetails, setOpenDetails] = useState(false)
  const [openDelete, setOpenDelete] = useState<number | null>(null)
  const [openCompare, setOpenCompare] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scans, setScans] = useState<Scan[]>([])

  // Create scan form state
  const [target, setTarget] = useState('')
  const [presetProfile, setPresetProfile] = useState<'web' | 'database' | 'remote_management' | 'top100' | 'custom'>('custom')
  const [portStart, setPortStart] = useState(20)
  const [portEnd, setPortEnd] = useState(1024)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    searchTerm: '',
    minPorts: '',
    maxPorts: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
      fetchScans()
    }
  }, [user, navigate])

  const fetchScans = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await scanService.listScans(0, 1000)
      setScans(response.items)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch scans')
      setScans([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) {
      setCreateError('Target hostname or IP address is required')
      return
    }

    setCreating(true)
    setCreateError(null)
    try {
      await scanService.createScan({
        target,
        port_range_start: presetProfile === 'custom' ? portStart : 20,
        port_range_end: presetProfile === 'custom' ? portEnd : 1024,
        preset_profile: presetProfile,
        scan_type: 'standard',
        timeout: 0.5,
        max_workers: 200,
        enable_service_detection: true,
        enable_banner_grabbing: false,
        tags: [presetProfile],
        notes: `Created via Dashboard (${presetProfile} preset)`,
      })
      setOpenCreate(false)
      setTarget('')
      fetchScans()
    } catch (err: any) {
      console.error('Create scan error:', err)
      setCreateError(err.response?.data?.detail || 'Failed to create scan')
    } finally {
      setCreating(false)
    }
  }

  const getFilteredScans = () => {
    let result = scans

    if (tabValue === 1) {
      result = result.filter((s) => s.status === 'completed')
    } else if (tabValue === 2) {
      result = result.filter((s) => s.status === 'running')
    } else if (tabValue === 3) {
      result = result.filter((s) => s.status === 'failed')
    }

    if (filters.searchTerm) {
      result = result.filter(
        (scan) =>
          scan.target_host.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          scan.target_ip.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
    }

    if (filters.status) {
      result = result.filter((scan) => scan.status === filters.status)
    }

    if (filters.minPorts) {
      result = result.filter((scan) => scan.open_ports_count >= parseInt(filters.minPorts))
    }
    if (filters.maxPorts) {
      result = result.filter((scan) => scan.open_ports_count <= parseInt(filters.maxPorts))
    }

    return result
  }

  const filteredScans = getFilteredScans()

  const paginatedScans = filteredScans.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewDetails = async (scan: Scan) => {
    setSelectedScan(scan)
    setOpenDetails(true)
    setLoadingDetails(true)
    try {
      const detail = await scanService.getScan(scan.id)
      setSelectedScan(detail)
      setScanResults(detail.results || [])
    } catch (err) {
      console.error('Failed to load scan details:', err)
      setScanResults([])
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setOpenDelete(id)
  }

  const handleConfirmDelete = async () => {
    if (openDelete) {
      try {
        await scanService.deleteScan(openDelete)
        setScans(scans.filter((s) => s.id !== openDelete))
        setOpenDelete(null)
      } catch (err: any) {
        setError('Failed to delete scan')
      }
    }
  }

  const handleExport = async (scan: Scan, format: 'json' | 'csv' | 'xml' | 'pdf' = 'json') => {
    try {
      const result = await scanService.exportScan(scan.id, format)
      const payload = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      const blob = new Blob([payload], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `security-scan-${scan.target_host}-${Date.now()}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError('Failed to export scan')
    }
  }

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'Critical':
        return { color: '#ff4d4f', bgcolor: 'rgba(255, 77, 79, 0.15)', border: '1px solid #ff4d4f' }
      case 'High':
        return { color: '#ff7a45', bgcolor: 'rgba(255, 122, 69, 0.15)', border: '1px solid #ff7a45' }
      case 'Medium':
        return { color: '#ffc53d', bgcolor: 'rgba(255, 197, 61, 0.15)', border: '1px solid #ffc53d' }
      case 'Low':
        return { color: '#73d13d', bgcolor: 'rgba(115, 209, 61, 0.15)', border: '1px solid #73d13d' }
      default:
        return { color: '#597ef7', bgcolor: 'rgba(89, 126, 247, 0.15)', border: '1px solid #597ef7' }
    }
  }

  const getStatusColor = (status: string) => {
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

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: isDarkMode ? '#05070a' : '#f8fafc', color: isDarkMode ? '#e6edf3' : '#0f172a' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, fontFamily: "'Share Tech Mono', monospace", color: isDarkMode ? '#00d9ff' : '#0284c7' }}>
              📋 SCANS MANAGEMENT
            </Typography>
            <Typography variant="body2" color={isDarkMode ? '#8b949e' : '#64748b'}>
              Manage network scans, CVE threat ratings, and scan comparisons
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenCreate(true)}
              sx={{
                background: 'linear-gradient(135deg, #00d9ff 0%, #667eea 100%)',
                color: '#ffffff',
                fontWeight: 'bold',
              }}
            >
              New Scan
            </Button>

            <Button
              variant="outlined"
              startIcon={<Compare />}
              onClick={() => setOpenCompare(true)}
              disabled={scans.length < 2}
              sx={{
                color: isDarkMode ? '#c9d1d9' : '#0f172a',
                borderColor: isDarkMode ? '#30363d' : '#cbd5e1',
                '&:hover': { bgcolor: isDarkMode ? '#161b22' : '#e2e8f0' },
              }}
            >
              Compare Scans
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchScans}
              disabled={loading}
              sx={{
                color: isDarkMode ? '#58a6ff' : '#0284c7',
                borderColor: isDarkMode ? '#30363d' : '#cbd5e1',
                '&:hover': { bgcolor: isDarkMode ? '#161b22' : '#e2e8f0' },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Stats Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card sx={{ bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0', color: isDarkMode ? '#c9d1d9' : '#0f172a' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="caption" color={isDarkMode ? '#8b949e' : '#64748b'}>Total Scans</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: isDarkMode ? '#00d9ff' : '#0284c7' }}>
                  {scans.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0', color: isDarkMode ? '#c9d1d9' : '#0f172a' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="caption" color={isDarkMode ? '#8b949e' : '#64748b'}>Completed</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                  {scans.filter(s => s.status === 'completed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0', color: isDarkMode ? '#c9d1d9' : '#0f172a' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="caption" color={isDarkMode ? '#8b949e' : '#64748b'}>Open Ports Found</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d97706' }}>
                  {scans.reduce((a, b) => a + b.open_ports_count, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0', color: isDarkMode ? '#c9d1d9' : '#0f172a' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="caption" color={isDarkMode ? '#8b949e' : '#64748b'}>Running Jobs</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7c3aed' }}>
                  {scans.filter(s => s.status === 'running').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3, bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0' }}>
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            sx={{
              '& .MuiTab-root': { color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold' },
              '& .Mui-selected': { color: isDarkMode ? '#00d9ff' : '#0284c7' },
              '& .MuiTabs-indicator': { bgcolor: isDarkMode ? '#00d9ff' : '#0284c7' },
            }}
          >
            <Tab label={`All (${scans.length})`} />
            <Tab label={`Completed (${scans.filter((s) => s.status === 'completed').length})`} />
            <Tab label={`Running (${scans.filter((s) => s.status === 'running').length})`} />
            <Tab label={`Failed (${scans.filter((s) => s.status === 'failed').length})`} />
          </Tabs>
        </Paper>

        {/* Search Input */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0' }}>
          <TextField
            fullWidth
            placeholder="Search target host or IP..."
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: isDarkMode ? '#8b949e' : '#64748b' }} />,
            }}
            value={filters.searchTerm}
            onChange={(e) => {
              setFilters({ ...filters, searchTerm: e.target.value })
              setPage(0)
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: isDarkMode ? '#c9d1d9' : '#0f172a',
                '& fieldset': { borderColor: isDarkMode ? '#30363d' : '#cbd5e1' },
              },
            }}
          />
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} sx={{ bgcolor: isDarkMode ? '#161b22' : '#ffffff', border: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0', mb: 2, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: isDarkMode ? '#0d1117' : '#f8fafc' }}>
                <TableCell sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold' }}>Target Host</TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold' }}>IP</TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold' }}>Open Ports</TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold' }}>Duration</TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold' }}>Created</TableCell>
                <TableCell align="center" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedScans.map((scan) => (
                <TableRow key={scan.id} sx={{ borderBottom: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0', '&:hover': { bgcolor: isDarkMode ? '#0d1117' : '#f1f5f9' } }}>
                  <TableCell sx={{ color: isDarkMode ? '#c9d1d9' : '#0f172a', fontWeight: 'bold' }}>{scan.target_host}</TableCell>
                  <TableCell align="center" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontSize: '0.9rem' }}>{scan.target_ip}</TableCell>
                  <TableCell align="center">
                    <Chip label={scan.status} size="small" variant="outlined" color={getStatusColor(scan.status) as any} />
                  </TableCell>
                  <TableCell align="center" sx={{ color: isDarkMode ? '#c9d1d9' : '#0f172a', fontWeight: 'bold' }}>{scan.open_ports_count}</TableCell>
                  <TableCell align="center" sx={{ color: isDarkMode ? '#c9d1d9' : '#0f172a' }}>{scan.duration_seconds ? scan.duration_seconds.toFixed(2) : '-'}s</TableCell>
                  <TableCell align="center" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', fontSize: '0.9rem' }}>{new Date(scan.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleViewDetails(scan)} title="View details" sx={{ color: isDarkMode ? '#00d9ff' : '#0284c7' }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleExport(scan, 'json')} title="Export JSON" sx={{ color: '#16a34a' }}>
                      <Download fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleExport(scan, 'pdf')} title="Export PDF" sx={{ color: '#ea580c' }}>
                      <PictureAsPdf fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(scan.id)} title="Delete" sx={{ color: '#dc2626' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredScans.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ bgcolor: isDarkMode ? '#161b22' : '#ffffff', color: isDarkMode ? '#c9d1d9' : '#0f172a' }}
        />

        {/* Create Scan Dialog */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: isDarkMode ? '#161b22' : '#ffffff', color: isDarkMode ? '#c9d1d9' : '#0f172a' } }}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>🚀 Create New Port Scan</DialogTitle>
          <Box component="form" onSubmit={handleCreateScan}>
            <DialogContent dividers>
              {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
              <TextField
                fullWidth
                label="Target (IP, Hostname, or CIDR range)"
                placeholder="127.0.0.1 or 192.168.1.0/28"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                margin="normal"
                required
              />

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Scan Preset Profile</InputLabel>
                <Select
                  value={presetProfile}
                  onChange={(e) => setPresetProfile(e.target.value as any)}
                  label="Scan Preset Profile"
                >
                  <MenuItem value="custom">Custom Port Range (20-1024)</MenuItem>
                  <MenuItem value="web">🌐 Web Services (80, 443, 8000, 8080, 8443)</MenuItem>
                  <MenuItem value="database">🗄️ Databases (1433, 1521, 3306, 5432, 6379, 27017)</MenuItem>
                  <MenuItem value="remote_management">🔑 Remote Admin (21, 22, 23, 3389, 5900)</MenuItem>
                  <MenuItem value="top100">🔥 Top 100 Well-Known Ports</MenuItem>
                </Select>
              </FormControl>

              {presetProfile === 'custom' && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Start Port" type="number" value={portStart} onChange={(e) => setPortStart(Number(e.target.value))} size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="End Port" type="number" value={portEnd} onChange={(e) => setPortEnd(Number(e.target.value))} size="small" />
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={creating} sx={{ background: 'linear-gradient(135deg, #00d9ff 0%, #667eea 100%)', color: 'white' }}>
                {creating ? <CircularProgress size={20} color="inherit" /> : 'Start Scan'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: isDarkMode ? '#161b22' : '#ffffff', color: isDarkMode ? '#c9d1d9' : '#0f172a' } }}>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield sx={{ color: '#00d9ff' }} /> Scan Details & Threat Ratings
            </Box>
            <IconButton size="small" onClick={() => setOpenDetails(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {selectedScan && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color={isDarkMode ? '#8b949e' : '#64748b'}>Target</Typography>
                    <Typography fontWeight="bold">{selectedScan.target_host}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color={isDarkMode ? '#8b949e' : '#64748b'}>IP Address</Typography>
                    <Typography fontWeight="bold">{selectedScan.target_ip}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color={isDarkMode ? '#8b949e' : '#64748b'}>Open Ports</Typography>
                    <Typography fontWeight="bold" color="#16a34a">{selectedScan.open_ports_count}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color={isDarkMode ? '#8b949e' : '#64748b'}>Duration</Typography>
                    <Typography fontWeight="bold">{selectedScan.duration_seconds ? selectedScan.duration_seconds.toFixed(2) : '-'}s</Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, color: isDarkMode ? '#00d9ff' : '#0284c7' }}>
                  Discovered Ports & CVE Risk Ratings
                </Typography>

                {loadingDetails ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={30} /></Box>
                ) : scanResults.length === 0 ? (
                  <Alert severity="info">No open ports found on target.</Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ bgcolor: isDarkMode ? '#0d1117' : '#f8fafc' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Port</TableCell>
                          <TableCell>Service</TableCell>
                          <TableCell>Risk Rating</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {scanResults.map((res) => {
                          const style = getRiskColor(res.risk_level)
                          return (
                            <TableRow key={res.port}>
                              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{res.port}</TableCell>
                              <TableCell>{res.service_name || 'Unknown'}</TableCell>
                              <TableCell>
                                <Chip label={res.risk_level || 'Info'} size="small" sx={{ color: style.color, bgcolor: style.bgcolor, border: style.border, fontWeight: 'bold' }} />
                              </TableCell>
                              <TableCell>{res.vulnerability_description}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDetails(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!openDelete} onClose={() => setOpenDelete(null)} PaperProps={{ sx: { bgcolor: isDarkMode ? '#161b22' : '#ffffff', color: isDarkMode ? '#c9d1d9' : '#0f172a' } }}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>⚠️ Delete Scan</DialogTitle>
          <DialogContent><Typography>Are you sure you want to delete this scan?</Typography></DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDelete(null)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Scan Comparison Modal */}
        <ScanComparisonModal open={openCompare} onClose={() => setOpenCompare(false)} scans={scans} />
      </Container>
    </Box>
  )
}
