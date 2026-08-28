import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { useAuthStore } from './store/authStore'
import { useUiStore } from './store/uiStore'
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
      main: '#1976d2',
    },
    secondary: {
      main: '#f57c00',
    },
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ffb74d',
    },
  },
})



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
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scans" element={<ScansPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
