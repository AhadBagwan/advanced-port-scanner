import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material'
import { Compare, AddCircle, RemoveCircle, SwapHoriz } from '@mui/icons-material'
import { scanService } from '@/services/scanService'
import type { Scan, ScanComparisonData } from '@/types'

interface ScanComparisonModalProps {
  open: boolean
  onClose: () => void
  scans: Scan[]
}

export const ScanComparisonModal: React.FC<ScanComparisonModalProps> = ({
  open,
  onClose,
  scans,
}) => {
  const [scan1Id, setScan1Id] = useState<number | ''>('')
  const [scan2Id, setScan2Id] = useState<number | ''>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comparison, setComparison] = useState<ScanComparisonData | null>(null)

  const handleCompare = async () => {
    if (!scan1Id || !scan2Id) {
      setError('Please select two scans to compare.')
      return
    }
    if (scan1Id === scan2Id) {
      setError('Please select two different scans.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await scanService.compareScans(Number(scan1Id), Number(scan2Id))
      setComparison(data)
    } catch (err: any) {
      console.error('Comparison error:', err)
      setError(err.response?.data?.detail || 'Failed to compare scans.')
    } finally {
      setIsLoading(false)
    }
  }

  const getChangeBadge = (type: string) => {
    switch (type) {
      case 'added':
        return <Chip icon={<AddCircle />} label="Newly Opened" color="success" size="small" />
      case 'removed':
        return <Chip icon={<RemoveCircle />} label="Closed / Remediated" color="error" size="small" />
      case 'modified':
        return <Chip icon={<SwapHoriz />} label="Modified Service" color="warning" size="small" />
      default:
        return <Chip label="Unchanged" size="small" sx={{ color: '#8b949e', border: '1px solid #30363d' }} />
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#161b22',
          color: '#c9d1d9',
          border: '1px solid #30363d',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Compare sx={{ color: '#667eea' }} /> Visual Scan Comparison & Diff Analysis
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#8b949e' }}>Base Scan (#1)</InputLabel>
              <Select
                value={scan1Id}
                onChange={(e) => setScan1Id(e.target.value as number)}
                label="Base Scan (#1)"
                sx={{
                  color: '#c9d1d9',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' },
                }}
              >
                {scans.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    #{s.id} - {s.target_host} ({new Date(s.created_at).toLocaleDateString()}) - {s.open_ports_count} ports
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#8b949e' }}>Comparison Scan (#2)</InputLabel>
              <Select
                value={scan2Id}
                onChange={(e) => setScan2Id(e.target.value as number)}
                label="Comparison Scan (#2)"
                sx={{
                  color: '#c9d1d9',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' },
                }}
              >
                {scans.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    #{s.id} - {s.target_host} ({new Date(s.created_at).toLocaleDateString()}) - {s.open_ports_count} ports
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleCompare}
              disabled={isLoading || !scan1Id || !scan2Id}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 'bold',
                py: 1,
              }}
            >
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Compare'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', color: '#ff6b6b' }}>
            {error}
          </Alert>
        )}

        {comparison && (
          <Box>
            {/* Diff Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #238636', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#3fb950', fontWeight: 'bold' }}>
                    NEWLY OPENED PORTS
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#3fb950', fontWeight: 'bold' }}>
                    +{comparison.added_ports.length}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #da3633', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#f85149', fontWeight: 'bold' }}>
                    REMEDIATED / CLOSED
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f85149', fontWeight: 'bold' }}>
                    -{comparison.removed_ports.length}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: '#0d1117', border: '1px solid #30363d', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#8b949e', fontWeight: 'bold' }}>
                    COMMON OPEN PORTS
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#c9d1d9', fontWeight: 'bold' }}>
                    {comparison.common_ports.length}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Detailed Diff Table */}
            <TableContainer component={Paper} sx={{ bgcolor: '#0d1117', border: '1px solid #30363d', maxHeight: 350 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#161b22', color: '#8b949e', fontWeight: 'bold' } }}>
                    <TableCell>Port</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Scan #{comparison.scan1.id} Status</TableCell>
                    <TableCell>Scan #{comparison.scan2.id} Status</TableCell>
                    <TableCell align="right">Change Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparison.details.map((detail) => (
                    <TableRow key={detail.port} hover sx={{ '& td': { color: '#c9d1d9', borderColor: '#30363d' } }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{detail.port}</TableCell>
                      <TableCell>{detail.service_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip
                          label={detail.status_scan1}
                          size="small"
                          color={detail.status_scan1 === 'open' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={detail.status_scan2}
                          size="small"
                          color={detail.status_scan2 === 'open' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{getChangeBadge(detail.change_type)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #30363d', p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#8b949e' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
