import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material'
import { Visibility, VisibilityOff, Mail, Lock, PersonOutline } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const isDarkMode = useUiStore((state) => state.theme === 'dark')

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.login(data.email, data.password)
      authService.setTokens(response.access_token, response.refresh_token)
      if (response.user) {
        authService.setCurrentUser(response.user)
        setUser(response.user)
      }
      navigate('/')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.login('guest@example.com', 'guest12345')
      authService.setTokens(response.access_token, response.refresh_token)
      if (response.user) {
        authService.setCurrentUser(response.user)
        setUser(response.user)
      }
      navigate('/')
    } catch (err: any) {
      console.error('Guest login error:', err)
      setError('Failed to sign in as Guest. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkMode
          ? `linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)`
          : `linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 50%, #cbd5e1 100%)`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
          background: `radial-gradient(circle, ${isDarkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(2, 132, 199, 0.08)'} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'moveGrid 20s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '@keyframes moveGrid': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: 0.3 },
          '50%': { transform: 'translate(20px, -20px)', opacity: 0.6 },
        },
        '@keyframes glow': {
          '0%, 100%': { boxShadow: isDarkMode ? '0 0 20px rgba(102, 126, 234, 0.3)' : '0 8px 30px rgba(0, 0, 0, 0.08)' },
          '50%': { boxShadow: isDarkMode ? '0 0 40px rgba(102, 126, 234, 0.6)' : '0 12px 40px rgba(0, 0, 0, 0.15)' },
        },
      }}
    >
      {/* Background Orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1), transparent)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {user && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor: isDarkMode ? '#161b22' : '#ffffff',
              border: '1px solid #00d9ff',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
            }}
          >
            <Typography variant="body2" sx={{ color: isDarkMode ? '#c9d1d9' : '#0f172a', fontWeight: 'bold' }}>
              Logged in as <strong>{user.username}</strong> ({user.email})
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/')}
              sx={{ background: 'linear-gradient(135deg, #00d9ff 0%, #667eea 100%)', color: 'white', fontWeight: 'bold' }}
            >
              Go to Dashboard
            </Button>
          </Paper>
        )}

        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            background: isDarkMode ? 'rgba(26, 31, 58, 0.85)' : '#ffffff',
            color: isDarkMode ? '#c9d1d9' : '#0f172a',
            backdropFilter: 'blur(10px)',
            border: isDarkMode ? '1px solid rgba(102, 126, 234, 0.2)' : '1px solid #cbd5e1',
            borderRadius: 3,
            boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.08)',
            animation: 'glow 3s ease-in-out infinite',
          }}
        >
          {/* Brand Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/logo.jpg"
              alt="Cyber Radar Logo"
              sx={{
                width: 85,
                height: 85,
                borderRadius: '50%',
                border: '3px solid #00d9ff',
                boxShadow: '0 0 30px rgba(0, 217, 255, 0.8)',
                mx: 'auto',
                mb: 1.5,
                display: 'block',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.08) rotate(10deg)' },
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #00d9ff 0%, #667eea 50%, #00ff88 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '2px',
                fontFamily: "'Share Tech Mono', monospace",
                mb: 0.2,
              }}
            >
              CYBER RADAR
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#0284c7',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                letterSpacing: '2px',
              }}
            >
              ADVANCED PORT SCANNER
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                bgcolor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : '#fef2f2',
                color: isDarkMode ? '#ff6b6b' : '#991b1b',
                border: isDarkMode ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid #fecaca',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              margin="normal"
              placeholder="you@example.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail sx={{ color: isDarkMode ? '#00d9ff' : '#0284c7', mr: 1, fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#e6edf3' : '#0f172a',
                  background: isDarkMode ? 'rgba(102, 126, 234, 0.05)' : '#f8fafc',
                  '& fieldset': { borderColor: isDarkMode ? 'rgba(102, 126, 234, 0.3)' : '#cbd5e1' },
                  '&:hover fieldset': { borderColor: isDarkMode ? '#00d9ff' : '#0284c7' },
                  '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#00d9ff' : '#0284c7' },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#8b949e' : '#334155',
                  fontWeight: 600,
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              margin="normal"
              placeholder="••••••••"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: isDarkMode ? '#00d9ff' : '#0284c7', mr: 1, fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: isDarkMode ? '#00d9ff' : '#0284c7' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#e6edf3' : '#0f172a',
                  background: isDarkMode ? 'rgba(102, 126, 234, 0.05)' : '#f8fafc',
                  '& fieldset': { borderColor: isDarkMode ? 'rgba(102, 126, 234, 0.3)' : '#cbd5e1' },
                  '&:hover fieldset': { borderColor: isDarkMode ? '#00d9ff' : '#0284c7' },
                  '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#00d9ff' : '#0284c7' },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#8b949e' : '#334155',
                  fontWeight: 600,
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 1.5,
                background: 'linear-gradient(135deg, #00d9ff 0%, #667eea 100%)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '1rem',
                py: 1.4,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #667eea 0%, #00d9ff 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 217, 255, 0.4)',
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'SIGN IN'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              startIcon={<PersonOutline />}
              sx={{
                mb: 2,
                borderColor: isDarkMode ? 'rgba(0, 217, 255, 0.5)' : '#0284c7',
                color: isDarkMode ? '#c9d1d9' : '#0f172a',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                py: 1.2,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: isDarkMode ? '#00d9ff' : '#0369a1',
                  bgcolor: isDarkMode ? 'rgba(0, 217, 255, 0.1)' : 'rgba(2, 132, 199, 0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              CONTINUE AS GUEST
            </Button>
          </Box>

          <Divider sx={{ my: 2.5, borderColor: isDarkMode ? '#30363d' : '#cbd5e1' }} />

          {/* Register Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#8b949e' : '#334155', fontWeight: 500 }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: isDarkMode ? '#00d9ff' : '#0284c7',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : '#64748b',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            © 2026 CYBER RADAR - ADVANCED PORT SCANNER. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
