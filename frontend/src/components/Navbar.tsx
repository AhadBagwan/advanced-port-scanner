import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { Dashboard, GridView, BarChart, Logout, Settings } from '@mui/icons-material'

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    clearAuth()
    authService.clearTokens()
    authService.clearCurrentUser()
    navigate('/login')
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: '#161b22',
        borderBottom: '1px solid #30363d',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Box
            sx={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontFamily: "'Share Tech Mono', monospace",
              letterSpacing: '1.5px',
            }}
            onClick={() => navigate('/')}
          >
            <Box
              component="img"
              src="/logo.jpg"
              alt="Cyber Radar Logo"
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '2px solid #00d9ff',
                boxShadow: '0 0 15px rgba(0, 217, 255, 0.6), inset 0 0 10px rgba(0, 217, 255, 0.4)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(10deg)',
                  boxShadow: '0 0 25px rgba(0, 217, 255, 0.9)',
                },
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #00d9ff 0%, #667eea 50%, #00ff88 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'Share Tech Mono', monospace",
                  lineHeight: 1.1,
                  fontSize: '1.15rem',
                }}
              >
                CYBER RADAR
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(0, 217, 255, 0.7)',
                  fontSize: '0.65rem',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                }}
              >
                PORT SCANNER v1.0
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            startIcon={<GridView />}
            onClick={() => navigate('/')}
            sx={{
              textTransform: 'none',
              color: '#8b949e',
              '&:hover': { color: '#c9d1d9' },
            }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<Dashboard />}
            onClick={() => navigate('/scans')}
            sx={{
              textTransform: 'none',
              color: '#8b949e',
              '&:hover': { color: '#c9d1d9' },
            }}
          >
            Scans
          </Button>
          <Button
            startIcon={<BarChart />}
            onClick={() => navigate('/analytics')}
            sx={{
              textTransform: 'none',
              color: '#8b949e',
              '&:hover': { color: '#c9d1d9' },
            }}
          >
            Analytics
          </Button>

          <Box>
            <Button
              onClick={handleMenu}
              sx={{
                textTransform: 'none',
                color: '#c9d1d9',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#667eea',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2">{user?.username}</Typography>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: { bgcolor: '#161b22', color: '#c9d1d9' },
              }}
            >
              <MenuItem disabled>📧 {user?.email}</MenuItem>
              <MenuItem
                onClick={() => {
                  navigate('/settings')
                  handleClose()
                }}
              >
                <Settings fontSize="small" sx={{ mr: 1 }} /> Settings
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{ color: '#f85149' }}
              >
                <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
