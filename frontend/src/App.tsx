import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material'
import { useAuthStore } from './store/authStore'
import { useUiStore } from './store/uiStore'
import { Navbar } from './components/Navbar'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard } from './pages/Dashboard'
import { ScansPage } from './pages/ScansPage'
import { AnalyticsPage } from './pages/AnalyticsPage'

// Create themes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0284c7',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d9ff',
    },
    secondary: {
      main: '#8b5cf6',
    },
    background: {
      default: '#05070a',
      paper: '#161b22',
    },
    text: {
      primary: '#e6edf3',
      secondary: '#8b949e',
    },
  },
})

// Protected Layout with Navigation Bar
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar />
      {children}
    </Box>
  )
}

const App: React.FC = () => {
  const isDarkMode = useUiStore((state) => state.theme === 'dark')
  const isAuthenticated = useAuthStore((state) => !!state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const theme = isDarkMode ? darkTheme : lightTheme

  // Load user from localStorage on mount
  React.useEffect(() => {
    const currentUser = localStorage.getItem('current_user')
    if (currentUser) {
      try {
        setUser(JSON.parse(currentUser))
      } catch (error) {
        console.error('Failed to load user from localStorage:', error)
      }
    }
  }, [setUser])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Main Routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/scans"
            element={
              isAuthenticated ? (
                <Layout>
                  <ScansPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/analytics"
            element={
              isAuthenticated ? (
                <Layout>
                  <AnalyticsPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
