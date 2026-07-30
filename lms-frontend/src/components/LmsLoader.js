import React from 'react';
import { motion } from 'framer-motion';

const SIZE_CONFIG = {
  sm: { diameter: 48, title: '0.9rem', subtitle: '0.75rem', gap: 10 },
  md: { diameter: 84, title: '1.05rem', subtitle: '0.88rem', gap: 14 },
  lg: { diameter: 116, title: '1.25rem', subtitle: '0.98rem', gap: 18 },
};

/** Shared KokonutUI-inspired loader, styled for the LMS blue/cyan visual system. */
function LmsLoader({
  title = 'Loading...',
  subtitle = 'Please wait a moment',
  size = 'md',
  compact = false,
  style,
}) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const ring = (background, mask, duration, reverse = false, opacity = 1) => ({
    position: 'absolute', inset: 0, borderRadius: '50%', background, mask,
    WebkitMask: mask, opacity, animation: `lms-loader-spin ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
  });

  return (
    <div style={{ ...styles.wrapper, ...(compact ? styles.compact : {}), ...style }} role="status" aria-live="polite">
      <style>{`@keyframes lms-loader-spin { to { transform: rotate(360deg); } } @keyframes lms-loader-breathe { 50% { transform: scale(1.035); } }`}</style>
      <motion.div
        animate={{ scale: [1, 1.035, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: config.diameter, height: config.diameter, position: 'relative', flex: '0 0 auto' }}
      >
        <div style={ring('conic-gradient(from 0deg, transparent 0deg, #0ea5e9 94deg, transparent 188deg)', 'radial-gradient(circle, transparent 34%, #000 36%, #000 40%, transparent 42%)', 3.2, false, 0.85)} />
        <div style={ring('conic-gradient(from 20deg, transparent 0deg, #2563eb 122deg, #06b6d4 220deg, transparent 330deg)', 'radial-gradient(circle, transparent 42%, #000 44%, #000 49%, transparent 51%)', 2.45, false, 0.95)} />
        <div style={ring('conic-gradient(from 180deg, transparent 0deg, rgba(99,102,241,.8) 58deg, transparent 105deg)', 'radial-gradient(circle, transparent 54%, #000 56%, #000 59%, transparent 61%)', 4.2, true, 0.55)} />
        <div style={ring('conic-gradient(from 270deg, transparent 0deg, rgba(14,165,233,.9) 22deg, transparent 47deg)', 'radial-gradient(circle, transparent 64%, #000 65%, #000 67%, transparent 68%)', 3.5, false, 0.7)} />
        <div style={styles.centerDot} />
      </motion.div>
      <div style={{ textAlign: compact ? 'left' : 'center', maxWidth: size === 'lg' ? 310 : 250 }}>
        <div style={{ ...styles.title, fontSize: config.title, marginBottom: config.gap / 3 }}>{title}</div>
        {subtitle && <div style={{ ...styles.subtitle, fontSize: config.subtitle }}>{subtitle}</div>}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: 190, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, color: '#0f172a' },
  compact: { minHeight: 'auto', padding: 10, flexDirection: 'row', justifyContent: 'flex-start', gap: 12 },
  centerDot: { position: 'absolute', inset: '44%', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #2563eb)', boxShadow: '0 0 16px rgba(14,165,233,.48)' },
  title: { fontWeight: 700, lineHeight: 1.25, color: '#1e3a8a' },
  subtitle: { color: '#64748b', lineHeight: 1.45 },
};

export default LmsLoader;
