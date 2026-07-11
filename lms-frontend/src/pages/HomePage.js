import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const heroVariants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

// Each role's hero mirrors the gradient/tone of the dashboard they'll land on next,
// so the homepage feels continuous with it rather than a generic landing page.
const THEMES = {
  student: {
    heading: 'Welcome back!',
    subheading: 'Learn at your own pace.',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', // matches StudentDashboard
    accent: '#3b82f6',
    accentBg: '#eff6ff',
    isDark: true,
  },
  instructor: {
    heading: 'Welcome back, Instructor!',
    subheading: 'Teach what you know. Manage courses easily.',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', // matches InstructorDashboard
    accent: '#3b82f6',
    accentBg: '#eff6ff',
    isDark: true,
  },
  admin: {
    heading: 'Admin Dashboard',
    subheading: 'Manage courses, users, and platform settings.',
    gradient: null, // AdminDashboard has no gradient — flat, neutral, serious tone
    accent: '#2c3e50',
    accentBg: '#f1f5f9',
    isDark: false,
  },
  guest: {
    heading: 'Welcome to LMS',
    subheading: 'Learn new skills, or teach what you know.',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    accent: '#06b6d4',
    accentBg: '#ecfeff',
    isDark: true,
  },
};

function HomePage() {
  const { user } = useAuth();
  const theme = THEMES[user?.role] || THEMES.guest;

  // Build the CTA cards for this role/guest state
  const cards = [
    {
      to: '/student/browse',
      Icon: Compass,
      title: 'Explore Courses',
      text: 'Browse what\'s available to learn',
      color: theme.accent,
      bg: theme.accentBg,
    },
  ];

  if (!user) {
    cards.push(
      { to: '/login', Icon: LogIn, title: 'Login', text: 'Already have an account?', color: '#3b82f6', bg: '#eff6ff' },
      { to: '/register', Icon: UserPlus, title: 'Register', text: 'New here? Create an account', color: '#27ae60', bg: '#eefdf3' },
    );
  } else if (user.role === 'student') {
    cards.push({ to: '/student/dashboard', Icon: LayoutDashboard, title: 'Go to Dashboard', text: 'Continue your learning journey', color: '#6366f1', bg: '#eef2ff' });
  } else if (user.role === 'instructor') {
    cards.push({ to: '/instructor/dashboard', Icon: LayoutDashboard, title: 'Go to Instructor Panel', text: 'Manage your courses and students', color: '#6366f1', bg: '#eef2ff' });
  } else if (user.role === 'admin') {
    cards.push({ to: '/admin/dashboard', Icon: LayoutDashboard, title: 'Go to Admin Panel', text: 'Oversee the whole platform', color: '#2c3e50', bg: '#f1f5f9' });
  }

  return (
    <div style={{ ...styles.container, backgroundColor: theme.isDark ? '#f8fafc' : '#ffffff' }}>

      {/* Hero */}
      <motion.div
        style={{
          ...styles.hero,
          background: theme.gradient || 'transparent',
          color: theme.isDark ? 'white' : '#2c3e50',
          boxShadow: theme.gradient ? `0 12px 30px ${theme.accent}4d` : 'none',
        }}
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 style={{ ...styles.heading, textShadow: theme.isDark ? '2px 2px 4px rgba(0,0,0,0.2)' : 'none' }}>
          {theme.heading}
        </h1>
        <p style={{ ...styles.subheading, color: theme.isDark ? 'white' : '#7f8c8d', opacity: theme.isDark ? 0.9 : 1 }}>
          {theme.subheading}
        </p>
      </motion.div>

      {/* CTA cards */}
      <motion.div
        style={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cards.map(({ to, Icon, title, text, color, bg }) => (
          <motion.div
            key={to}
            variants={cardVariants}
            whileHover={{
              y: -8,
              boxShadow: `0 20px 40px ${color}33`,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            whileTap={{ scale: 0.97 }}
            style={{ ...styles.card, border: `1px solid ${color}22` }}
          >
            <Link to={to} style={styles.cardLink}>
              <div style={{ ...styles.iconWrap, backgroundColor: bg }}>
                <Icon size={30} color={color} strokeWidth={1.75} />
              </div>
              <h3 style={{ ...styles.cardTitle, color }}>{title}</h3>
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
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '3rem 2rem',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '80vh',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '3rem 2rem',
    borderRadius: '20px',
  },
  heading: {
    fontSize: '2.75rem',
    fontWeight: '700',
    margin: '0 0 0.6rem',
  },
  subheading: {
    fontSize: '1.2rem',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    cursor: 'pointer',
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
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    margin: '0 0 0.4rem',
  },
  cardText: {
    color: '#6b7280',
    fontSize: '0.9rem',
    margin: 0,
  },
};

export default HomePage;