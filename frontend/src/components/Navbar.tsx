import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { authService } from '@/services/authService'
import {
  Dashboard,
  GridView,
  BarChart,
  Logout,
  LightMode,
  DarkMode,
  AccountCircle,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { ProfileModal } from './ProfileModal'

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const isDarkMode = useUiStore((state) => state.theme === 'dark')
  const toggleTheme = useUiStore((state) => state.toggleTheme)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

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

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <GridView /> },
    { label: 'Scans', path: '/scans', icon: <Dashboard /> },
    { label: 'Analytics', path: '/analytics', icon: <BarChart /> },
  ]

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: isDarkMode ? '#161b22' : '#ffffff',
          color: isDarkMode ? '#c9d1d9' : '#0f172a',
          borderBottom: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0',
          boxShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo & Brand */}
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
                boxShadow: '0 0 15px rgba(0, 217, 255, 0.6)',
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
                  fontSize: { xs: '1rem', sm: '1.15rem' },
                }}
              >
                CYBER RADAR
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDarkMode ? 'rgba(0, 217, 255, 0.7)' : '#0284c7',
                  fontSize: '0.65rem',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                }}
              >
                PORT SCANNER
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  textTransform: 'none',
                  color: isDarkMode ? '#8b949e' : '#475569',
                  fontWeight: 600,
                  '&:hover': { color: isDarkMode ? '#c9d1d9' : '#0f172a' },
                }}
              >
                {item.label}
              </Button>
            ))}

            {/* Light / Dark Mode Toggle */}
            <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: isDarkMode ? '#ffb020' : '#4f46e5',
                  bgcolor: isDarkMode ? 'rgba(255, 176, 32, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(255, 176, 32, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                  },
                }}
              >
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            {/* Profile Button */}
            <Button
              onClick={() => setProfileOpen(true)}
              startIcon={<AccountCircle />}
              sx={{
                textTransform: 'none',
                color: isDarkMode ? '#00d9ff' : '#0284c7',
                fontWeight: 'bold',
              }}
            >
              Profile
            </Button>

            {/* User Dropdown */}
            <Box>
              <Button
                onClick={handleMenu}
                sx={{
                  textTransform: 'none',
                  color: isDarkMode ? '#c9d1d9' : '#0f172a',
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
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{user?.username}</Typography>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: isDarkMode ? '#161b22' : '#ffffff',
                    color: isDarkMode ? '#c9d1d9' : '#0f172a',
                    border: isDarkMode ? '1px solid #30363d' : '1px solid #e2e8f0',
                  },
                }}
              >
                <MenuItem disabled>📧 {user?.email}</MenuItem>
                <MenuItem
                  onClick={() => {
                    setProfileOpen(true)
                    handleClose()
                  }}
                >
                  <AccountCircle fontSize="small" sx={{ mr: 1 }} /> View Profile
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: '#f85149' }}>
                  <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Mobile Right Icons (Hamburger & Theme Toggle) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <IconButton onClick={toggleTheme} sx={{ color: isDarkMode ? '#ffb020' : '#4f46e5' }}>
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
            <IconButton onClick={() => setMobileDrawerOpen(true)} sx={{ color: isDarkMode ? '#c9d1d9' : '#0f172a' }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: isDarkMode ? '#161b22' : '#ffffff',
            color: isDarkMode ? '#c9d1d9' : '#0f172a',
            p: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: "'Share Tech Mono', monospace", color: '#00d9ff' }}>
            NAVIGATION
          </Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon sx={{ color: isDarkMode ? '#c9d1d9' : '#0f172a' }} />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2, borderColor: isDarkMode ? '#30363d' : '#e2e8f0' }} />

        {user && (
          <Box sx={{ p: 1.5, mb: 2, bgcolor: isDarkMode ? '#0d1117' : '#f1f5f9', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#667eea', fontWeight: 'bold' }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{user.username}</Typography>
              <Typography variant="caption" sx={{ color: isDarkMode ? '#8b949e' : '#64748b', display: 'block' }}>{user.email}</Typography>
            </Box>
          </Box>
        )}

        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  setMobileDrawerOpen(false)
                }}
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <ListItemIcon sx={{ color: isDarkMode ? '#00d9ff' : '#0284c7' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                setProfileOpen(true)
                setMobileDrawerOpen(false)
              }}
              sx={{ borderRadius: 1.5, mb: 0.5 }}
            >
              <ListItemIcon sx={{ color: isDarkMode ? '#00d9ff' : '#0284c7' }}><AccountCircle /></ListItemIcon>
              <ListItemText primary="User Profile" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{ borderRadius: 1.5, color: '#f85149' }}
            >
              <ListItemIcon sx={{ color: '#f85149' }}><Logout /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Profile Modal */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
