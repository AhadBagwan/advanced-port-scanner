import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Radar,
  Shield,
  Zap,
  TrendingUp,
  Plus,
  Download,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { GlassCard, StatusBadge, AnimatedCounter, MetricCard, CyberProgressBar, CyberDivider } from '../Common/UIComponents';
import '../../styles/cyber-design.css';

export const PremiumDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeScans: 2,
    openPorts: 47,
    threatsDetected: 3,
    uptime: 99.8,
  });

  const [recentScans] = useState([
    {
      id: 1,
      target: 'localhost',
      ports: '3000-3010',
      progress: 100,
      status: 'completed',
      openPorts: 1,
      duration: 45,
      time: '2 min ago',
    },
    {
      id: 2,
      target: 'localhost',
      ports: '8000-8010',
      progress: 45,
      status: 'scanning',
      openPorts: 0,
      duration: 0,
      time: 'Scanning...',
    },
  ]);

  // Animate numbers
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        openPorts: Math.max(40, Math.min(60, prev.openPorts + (Math.random() - 0.5) * 5)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-[#05070a] overflow-hidden">
      {/* Grid background */}
      <div
        className="fixed inset-0 -z-10 opacity-5"
        style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent),
                          linear-gradient(90deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Scan lines effect */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-5"
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

      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 border-b border-[#00d9ff]/10 bg-[#05070a]/80 backdrop-blur"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-widest">NETSCAN DASHBOARD</h1>
            <p className="text-xs text-[#8b949e] mt-1">Real-Time Network Reconnaissance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-[#00ff88] font-mono">
              <span className="status-dot status-online" />
              SYSTEM ONLINE
            </div>
            <button className="btn btn-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>NEW SCAN</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Metric: Active Scans */}
          <motion.div variants={itemVariants}>
            <MetricCard
              label="Active Scans"
              value={stats.activeScans}
              icon={<Activity className="w-6 h-6" />}
              color="cyan"
              trend={5}
            />
          </motion.div>

          {/* Metric: Open Ports */}
          <motion.div variants={itemVariants}>
            <MetricCard
              label="Open Ports"
              value={Math.round(stats.openPorts)}
              icon={<Radar className="w-6 h-6" />}
              color="neon"
              trend={-2}
            />
          </motion.div>

          {/* Metric: Threats Detected */}
          <motion.div variants={itemVariants}>
            <MetricCard
              label="Threats Detected"
              value={stats.threatsDetected}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="danger"
              trend={0}
            />
          </motion.div>

          {/* Metric: System Uptime */}
          <motion.div variants={itemVariants}>
            <MetricCard
              label="System Uptime"
              value={`${stats.uptime}%`}
              icon={<Shield className="w-6 h-6" />}
              color="cyan"
            />
          </motion.div>
        </motion.div>

        {/* Quick Actions & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard>
              <h2 className="text-lg font-bold mb-6 text-[#e6edf3]">QUICK ACTIONS</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn btn-secondary flex items-center justify-center space-x-2 py-3">
                  <Zap className="w-4 h-4" />
                  <span>QUICK SCAN</span>
                </button>
                <button className="btn btn-secondary flex items-center justify-center space-x-2 py-3">
                  <Clock className="w-4 h-4" />
                  <span>SCHEDULE</span>
                </button>
                <button className="btn btn-secondary flex items-center justify-center space-x-2 py-3">
                  <Download className="w-4 h-4" />
                  <span>EXPORT</span>
                </button>
                <button className="btn btn-secondary flex items-center justify-center space-x-2 py-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>ANALYTICS</span>
                </button>
              </div>
            </GlassCard>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard>
              <h2 className="text-lg font-bold mb-6 text-[#e6edf3]">SYSTEM STATUS</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs uppercase text-[#8b949e] font-mono">CPU Usage</span>
                    <span className="text-xs text-[#00d9ff] font-mono">35%</span>
                  </div>
                  <CyberProgressBar value={35} color="cyan" showLabel={false} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs uppercase text-[#8b949e] font-mono">Memory</span>
                    <span className="text-xs text-[#00d9ff] font-mono">58%</span>
                  </div>
                  <CyberProgressBar value={58} color="cyan" showLabel={false} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs uppercase text-[#8b949e] font-mono">Network</span>
                    <span className="text-xs text-[#00ff88] font-mono">OK</span>
                  </div>
                  <CyberProgressBar value={100} color="neon" showLabel={false} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Live Scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#e6edf3]">LIVE SCANS</h2>
              <StatusBadge status="processing" label="2 ACTIVE" size="sm" />
            </div>

            <div className="space-y-4">
              {recentScans.map((scan, idx) => (
                <motion.div
                  key={scan.id}
                  className="border border-[#00d9ff]/10 rounded-lg p-4 hover:border-[#00d9ff]/30 transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono font-bold text-[#e6edf3]">{scan.target}</p>
                      <p className="text-xs text-[#8b949e] mt-1">
                        Ports: {scan.ports}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge
                        status={scan.status === 'scanning' ? 'processing' : 'online'}
                        label={scan.status.toUpperCase()}
                        size="sm"
                      />
                      <span className="text-xs text-[#6e7681]">{scan.time}</span>
                    </div>
                  </div>

                  <CyberProgressBar
                    value={scan.progress}
                    color={scan.status === 'scanning' ? 'cyan' : 'neon'}
                  />

                  <div className="mt-4 flex items-center justify-between text-xs font-mono text-[#8b949e]">
                    <span>
                      {scan.openPorts}{' '}
                      <span className="text-[#00ff88]">open ports</span>
                    </span>
                    <span>{scan.duration}s elapsed</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Radar Effect */}
        <motion.div
          className="mt-8 h-64 glass cyber-border rounded-lg flex items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative w-48 h-48">
            {[1, 2, 3, 4].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 rounded-full border border-[#00d9ff]/20"
                style={{
                  width: `${ring * 40}px`,
                  height: `${ring * 40}px`,
                  left: `calc(50% - ${ring * 20}px)`,
                  top: `calc(50% - ${ring * 20}px)`,
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20 - ring * 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}

            {/* Center dot */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#00d9ff] rounded-full"
              style={{ transform: 'translate(-50%, -50%)' }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Scan sweep */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(0, 217, 255, 0.3), transparent)',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
          <p className="absolute text-xs text-[#00d9ff] font-mono bottom-4">
            NETWORK TOPOLOGY SCAN
          </p>
        </motion.div>
      </main>
    </div>
  );
};
