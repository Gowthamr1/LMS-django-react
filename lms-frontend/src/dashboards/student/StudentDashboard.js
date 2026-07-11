import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PlayCircle, TrendingUp } from 'lucide-react';

// ── Animation variants ────────────────────────────────────────────
const headerVariants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

// ── Card data ─────────────────────────────────────────────────────
const cards = [
  {
    to: '/student/browse',
    Icon: BookOpen,
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
    title: 'Browse Courses',
    text: 'Explore new subjects and skills',
  },
  {
    to: '/student/lessons',
    Icon: PlayCircle,
    iconColor: '#6366f1',
    iconBg: '#eef2ff',
    title: 'Continue Lessons',
    text: 'Pick up where you left off',
  },
  {
    to: '/student/progress',
    Icon: TrendingUp,
    iconColor: '#06b6d4',
    iconBg: '#ecfeff',
    title: 'Track Progress',
    text: 'See your learning journey',
  },
];

function StudentDashboard() {
  return (
    <div style={styles.container}>

      {/* Header — fades in from top */}
      <motion.div
        style={styles.header}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 style={styles.title}>🚀 Learning Dashboard</h1>
        <p style={styles.subtitle}>Ready for your next learning adventure?</p>
      </motion.div>

      {/* Cards — staggered slide up, floating "3D" elevation */}
      <motion.div
        style={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cards.map(({ to, Icon, iconColor, iconBg, title, text }) => (
          <motion.div
            key={to}
            variants={cardVariants}
            whileHover={{
              y: -10,
              rotateX: 4,
              rotateY: -4,
              boxShadow: `0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.06), 0 24px 40px ${iconColor}40`,
              transition: { duration: 0.25, ease: 'easeOut' },
            }}
            whileTap={{ scale: 0.97 }}
            style={{ ...styles.card, border: `1px solid ${iconColor}22` }}
          >
            <Link to={to} style={styles.cardLink}>
              {/* Icon */}
              <div style={{ ...styles.iconWrap, backgroundColor: iconBg }}>
                <Icon size={32} color={iconColor} strokeWidth={1.75} />
              </div>
              <h3 style={styles.cardTitle}>{title}</h3>
              <p style={styles.cardText}>{text}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    perspective: '1200px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '3.25rem 2rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 12px 30px rgba(59,130,246,0.3)',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '0.6rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '1.35rem',
    opacity: 0.9,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    padding: '1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    // Layered shadow to read as "raised off the page" rather than a flat drop-shadow
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 12px rgba(0,0,0,0.06), 0 16px 28px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    cursor: 'pointer',
    transformStyle: 'preserve-3d',
  },
  cardLink: {
    display: 'block',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#1f2937',
  },
  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '70px',
    height: '70px',
    borderRadius: '16px',
    marginBottom: '1.25rem',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1e40af',
  },
  cardText: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0,
  },
};

export default StudentDashboard;