import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = false,
}) => (
  <motion.div
    className={`glass cyber-border rounded-lg p-6 ${className}`}
    whileHover={hover ? { scale: 1.02 } : undefined}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

interface StatusBadgeProps {
  status?: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'processing',
  label,
  size = 'md',
}) => {
  const getStatusColor = (s: string) => {
    if (s.includes('completed') || s.includes('success')) return 'bg-[#00ff88] text-[#05070a]';
    if (s.includes('scanning') || s.includes('processing')) return 'bg-[#00d9ff] text-[#05070a]';
    if (s.includes('pending') || s.includes('queued')) return 'bg-[#ffb020] text-[#05070a]';
    if (s.includes('failed') || s.includes('error')) return 'bg-[#ff4d4d] text-white';
    return 'bg-[#6e7681] text-white';
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);
  const isProcessing = status.includes('scanning') || status.includes('processing');

  return (
    <motion.div
      className={`inline-block rounded font-mono font-bold uppercase tracking-wider ${
        getStatusColor(status)
      } ${sizeClasses[size]}`}
      animate={{
        boxShadow: isProcessing
          ? [
              '0 0 10px rgba(0, 217, 255, 0.3)',
              '0 0 20px rgba(0, 217, 255, 0.5)',
              '0 0 10px rgba(0, 217, 255, 0.3)',
            ]
          : undefined,
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {displayLabel}
    </motion.div>
  );
};

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  duration = 1,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="font-bold text-2xl text-[#00d9ff] font-mono"
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {prefix}
        {value}
        {suffix}
      </motion.span>
    </motion.div>
  );
};

interface CyberDividerProps {
  className?: string;
}

export const CyberDivider: React.FC<CyberDividerProps> = ({
  className = '',
}) => (
  <div
    className={`h-px bg-gradient-to-r from-transparent via-[#00d9ff]/20 to-transparent ${className}`}
  />
);

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: 'cyan' | 'neon' | 'danger' | 'warning';
}

export const CyberProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = true,
  color = 'cyan',
}) => {
  const colorMap = {
    cyan: 'from-[#00d9ff] to-[#00d9ff]',
    neon: 'from-[#00ff88] to-[#00ff88]',
    danger: 'from-[#ff4d4d] to-[#ff4d4d]',
    warning: 'from-[#ffb020] to-[#ffb020]',
  };

  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="w-full h-2 bg-[#0b0f14] rounded-full overflow-hidden border border-[#00d9ff]/10">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorMap[color]} shadow-lg`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            boxShadow: `0 0 20px rgba(0, 217, 255, 0.5), inset 0 0 10px rgba(0, 217, 255, 0.2)`,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-[#8b949e] font-mono">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'cyan' | 'neon' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'cyan',
}) => {
  const colorMap = {
    cyan: 'from-[#00d9ff] to-[#00d9ff]',
    neon: 'from-[#00ff88] to-[#00ff88]',
    danger: 'from-[#ff4d4d] to-[#ff4d4d]',
  };

  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#8b949e] font-mono mb-2">
            {label}
          </p>
          <motion.p
            className={`text-3xl font-bold font-mono bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {value}
          </motion.p>
          {trend !== undefined && (
            <p
              className={`text-xs mt-2 font-mono ${
                trend > 0 ? 'text-[#00ff88]' : 'text-[#ff4d4d]'
              }`}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last hour
            </p>
          )}
        </div>
        <motion.div
          className={`p-3 rounded-lg bg-gradient-to-r ${colorMap[color]}/10 border border-${color === 'cyan' ? '[#00d9ff]' : color === 'neon' ? '[#00ff88]' : '[#ff4d4d]'}/20`}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className={`w-6 h-6 text-${color === 'cyan' ? '[#00d9ff]' : color === 'neon' ? '[#00ff88]' : '[#ff4d4d]'}`}>
            {icon}
          </div>
        </motion.div>
      </div>
    </GlassCard>
  );
};
