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
  const setTokens = useAuthStore((state) => state.setTokens)
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
      console.log('Attempting login with:', data.email)
      const response = await authService.login(data.email, data.password)
      
      console.log('Login response:', response)
      authService.setTokens(response.access_token, response.refresh_token)

      if (!response.user) {
        throw new Error('Login succeeded but user profile was missing.')
      }

      setUser(response.user)
      authService.setCurrentUser(response.user)
      
      console.log('Login successful, navigating to dashboard')
      navigate('/')
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Logging in as Guest...')
      const response = await authService.login('guest@example.com', 'guest12345')
      authService.setTokens(response.access_token, response.refresh_token)

      if (response.user) {
        setUser(response.user)
        authService.setCurrentUser(response.user)
      }

      console.log('Guest login successful, navigating to dashboard')
      navigate('/')
    } catch (err: any) {
      console.error('Guest login error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Guest login failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isDarkMode = useUiStore((state) => state.theme === 'dark')

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkMode
          ? `linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)`
          : `linear-gradient(135deg, #e0f2fe 0%, #f1f5f9 50%, #bae6fd 100%)`,
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
          background: `radial-gradient(circle, ${isDarkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(2, 132, 199, 0.1)'} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'moveGrid 20s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '@keyframes moveGrid': {
          '0%': {
            transform: 'translate(0, 0)',
          },
          '100%': {
            transform: 'translate(50px, 50px)',
          },
        },
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translate(0, 0)',
            opacity: 0.3,
          },
          '50%': {
            transform: 'translate(20px, -20px)',
            opacity: 0.6,
          },
        },
        '@keyframes glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(102, 126, 234, 0.6)',
          },
        },
      }}
    >
      {/* Animated background elements */}
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
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(245, 124, 0, 0.05), transparent)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite',
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
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2" sx={{ color: isDarkMode ? '#c9d1d9' : '#1f2937' }}>
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
            p: 4,
            background: isDarkMode ? 'rgba(26, 31, 58, 0.85)' : 'rgba(255, 255, 255, 0.95)',
            color: isDarkMode ? '#c9d1d9' : '#1e293b',
            backdropFilter: 'blur(10px)',
            border: isDarkMode ? '1px solid rgba(102, 126, 234, 0.2)' : '1px solid rgba(2, 132, 199, 0.2)',
            borderRadius: 2,
            boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
            animation: 'glow 3s ease-in-out infinite',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/logo.jpg"
              alt="Cyber Radar Logo"
              sx={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                border: '3px solid #00d9ff',
                boxShadow: '0 0 30px rgba(0, 217, 255, 0.8), inset 0 0 20px rgba(0, 217, 255, 0.4)',
                mx: 'auto',
                mb: 2,
                display: 'block',
                animation: 'pulseGlow 3s ease-in-out infinite',
                '@keyframes pulseGlow': {
                  '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.6)' },
                  '50%': { boxShadow: '0 0 45px rgba(0, 217, 255, 1)' },
                },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 1,
              }}
            >
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
                }}
              >
                CYBER RADAR
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                letterSpacing: '2px',
              }}
            >
              NETWORK INTELLIGENCE PLATFORM
            </Typography>
          </Box>

          <Divider
            sx={{
              mb: 3,
              background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
              height: '1px',
            }}
          />

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                background: 'rgba(244, 67, 54, 0.1)',
                color: '#ff6b6b',
                border: '1px solid rgba(244, 67, 54, 0.3)',
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
                    <Mail sx={{ color: '#667eea', mr: 1, fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  '&:hover': {
                    borderColor: 'rgba(102, 126, 234, 0.4)',
                  },
                  '&.Mui-focused': {
                    borderColor: '#667eea',
                    background: 'rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 0 20px rgba(102, 126, 234, 0.2)',
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff6b6b',
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
                    <Lock sx={{ color: '#667eea', mr: 1, fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{
                        color: '#667eea',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.1)',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  '&:hover': {
                    borderColor: 'rgba(102, 126, 234, 0.4)',
                  },
                  '&.Mui-focused': {
                    borderColor: '#667eea',
                    background: 'rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 0 20px rgba(102, 126, 234, 0.2)',
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff6b6b',
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                py: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                },
                '&:disabled': {
                  background: 'rgba(102, 126, 234, 0.3)',
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
                borderColor: 'rgba(102, 126, 234, 0.5)',
                color: '#c9d1d9',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                py: 1.2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#667eea',
                  color: 'white',
                  background: 'rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 20px rgba(102, 126, 234, 0.2)',
                },
                '&:disabled': {
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              CONTINUE AS GUEST
            </Button>
          </Box>

          <Divider
            sx={{
              my: 2,
              background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent)',
            }}
          />

          {/* Register Link */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as any).style.color = '#764ba2'
                  ;(e.target as any).style.textDecoration = 'underline'
                }}
                onMouseLeave={(e) => {
                  (e.target as any).style.color = '#667eea'
                  ;(e.target as any).style.textDecoration = 'none'
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Box>

          {/* Demo Credentials */}
          <Box
            sx={{
              p: 2,
              background: 'rgba(102, 126, 234, 0.05)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              borderRadius: 1,
              backdropFilter: 'blur(5px)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: '#667eea',
                fontWeight: 'bold',
                mb: 1,
                fontFamily: 'monospace',
              }}
            >
              DEMO CREDENTIALS
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
              }}
            >
              Email: admin@example.com
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
              }}
            >
              Pass: admin123
            </Typography>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, zIndex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
            }}
          >
            © 2026 PORT SCANNER. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
