import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Paper,
  IconButton,
  Divider,
} from '@mui/material'
import { Close, AccountCircle, Shield, Email, CheckCircle } from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const user = useAuthStore((state) => state.user)
  const isDarkMode = useUiStore((state) => state.theme === 'dark')

  if (!user) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDarkMode ? '#161b22' : '#ffffff',
          color: isDarkMode ? '#c9d1d9' : '#1f2937',
          border: isDarkMode ? '1px solid #30363d' : '1px solid #e5e7eb',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: isDarkMode ? '1px solid #30363d' : '1px solid #e5e7eb',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountCircle sx={{ color: '#00d9ff' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: "'Share Tech Mono', monospace" }}>
            USER PROFILE
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Close sx={{ color: isDarkMode ? '#8b949e' : '#6b7280' }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 70,
              height: 70,
              bgcolor: '#667eea',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 1.5,
              boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)',
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {user.username}
          </Typography>
          <Chip
            label={user.role.toUpperCase()}
            size="small"
            color={user.role === 'admin' ? 'secondary' : 'primary'}
            sx={{ mt: 0.5, fontWeight: 'bold', fontSize: '0.75rem' }}
          />
        </Box>

        <Divider sx={{ my: 2, borderColor: isDarkMode ? '#30363d' : '#e5e7eb' }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 1.5,
                bgcolor: isDarkMode ? '#0d1117' : '#f9fafb',
                border: isDarkMode ? '1px solid #30363d' : '1px solid #f3f4f6',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Email sx={{ color: '#00d9ff' }} />
              <Box>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#8b949e' : '#6b7280', display: 'block' }}>
                  Email Address
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {user.email}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              sx={{
                p: 1.5,
                bgcolor: isDarkMode ? '#0d1117' : '#f9fafb',
                border: isDarkMode ? '1px solid #30363d' : '1px solid #f3f4f6',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Shield sx={{ color: '#00ff88' }} />
              <Box>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#8b949e' : '#6b7280', display: 'block' }}>
                  Account Role
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {user.role === 'admin' ? 'Administrator (Full Access)' : 'Standard User / Viewer'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              sx={{
                p: 1.5,
                bgcolor: isDarkMode ? '#0d1117' : '#f9fafb',
                border: isDarkMode ? '1px solid #30363d' : '1px solid #f3f4f6',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CheckCircle sx={{ color: '#3fb950' }} />
              <Box>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#8b949e' : '#6b7280', display: 'block' }}>
                  Account Status
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#3fb950' }}>
                  Active & Verified
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: isDarkMode ? '1px solid #30363d' : '1px solid #e5e7eb' }}>
        <Button onClick={onClose} variant="contained" fullWidth sx={{ background: 'linear-gradient(135deg, #00d9ff 0%, #667eea 100%)', color: 'white' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
