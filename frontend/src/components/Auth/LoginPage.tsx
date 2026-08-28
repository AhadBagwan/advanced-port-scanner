import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Shield, AlertCircle } from 'lucide-react';
import { LoginBackground } from './LoginBackground';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import '../../../src/styles/cyber-design.css';

export const PremiumLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: 'admin123',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      console.log('Login response:', response.data);
      
      // Save tokens
      setTokens(response.data.access_token, response.data.refresh_token);
      
      // Save user
      setUser(response.data.user);
      
      // Save to localStorage for persistence
      localStorage.setItem('current_user', JSON.stringify(response.data.user));
      
      // Show boot sequence animation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Authentication failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="relative w-full min-h-screen bg-[#05070a] overflow-hidden flex items-center justify-center">
      <LoginBackground />

      {/* Scan lines effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 217, 255, 0.15) 2px,
            rgba(0, 217, 255, 0.15) 4px
          )`,
          animation: 'scan-line 8s linear infinite',
        }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo & Branding */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-16 h-16 glass cyber-border flex items-center justify-center rounded-lg"
              animate={{ rotateZ: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Shield className="w-8 h-8 glow-neon" />
            </motion.div>
          </div>

          <h1 className="text-3xl font-bold tracking-widest mb-2">NETSCAN</h1>
          <p className="text-sm text-[#8b949e] tracking-wider">
            NETWORK RECONNAISSANCE ENGINE
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="glass cyber-border rounded-xl p-8 space-y-6 shadow-xl"
          variants={itemVariants}
        >
          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 text-xs tracking-widest text-[#00d9ff]">
            <Lock className="w-3 h-3" />
            <span>AUTHORIZED ACCESS ONLY</span>
            <Lock className="w-3 h-3" />
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              className="bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 rounded-lg p-3 flex items-start space-x-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-4 h-4 text-[#ff4d4d] mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#ff4d4d]">{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8b949e] mb-2">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0b0f14] border border-[#00d9ff]/20 rounded-lg 
                           text-[#e6edf3] font-mono text-sm
                           focus:border-[#00d9ff] focus:outline-none focus:ring-1 focus:ring-[#00d9ff]
                           transition-all duration-200 placeholder-[#6e7681]"
                placeholder="admin@example.com"
              />
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8b949e] mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0b0f14] border border-[#00d9ff]/20 rounded-lg 
                           text-[#e6edf3] font-mono text-sm
                           focus:border-[#00d9ff] focus:outline-none focus:ring-1 focus:ring-[#00d9ff]
                           transition-all duration-200 placeholder-[#6e7681]"
                placeholder="••••••••"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 bg-[#00d9ff] text-[#05070a] font-bold uppercase text-sm
                         rounded-lg transition-all duration-200 tracking-wider
                         hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         shadow-[0_0_20px_rgba(0,217,255,0.3)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'AUTHENTICATING...' : 'INITIALIZE ACCESS'}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          className="mt-8 text-center text-xs text-[#6e7681] space-y-1"
          variants={itemVariants}
        >
          <p>Premium Network Reconnaissance Platform</p>
          <p>v1.0.0 • Enterprise Edition</p>
        </motion.div>
      </motion.div>

      {/* Loading overlay */}
      {loading && (
        <motion.div
          className="fixed inset-0 bg-[#05070a] flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-2 border-[#00d9ff] border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-[#00d9ff] font-mono text-sm uppercase tracking-wider">
              INITIALIZING SYSTEM
            </p>
            <p className="text-[#6e7681] font-mono text-xs mt-2">
              LOADING SECURITY MODULES...
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
