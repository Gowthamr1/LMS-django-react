import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { title: 'Create Course', icon: '📘', path: '/instructor/create-course', description: 'Develop new courses and structure your curriculum' },
  { title: 'Upload Lesson', icon: '🎬', path: '/instructor/create-lesson', description: 'Add lessons, videos, and educational materials' },
  { title: 'Manage Courses', icon: '📚', path: '/instructor/my-courses', description: 'Edit existing courses and update content' },
  { title: 'Student Enrollments', icon: '👥', path: '/instructor/enrollments', description: 'Track student registrations and progress' },
  { title: 'Course Reviews', icon: '⭐', path: '/instructor/reviews', description: 'Monitor feedback and ratings from students' },
  { title: 'Quiz Management', icon: '🧠', path: '/instructor/quiz', description: 'Create and manage assessments for your courses' },
];

function InstructorDashboard() {
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.heading}>Welcome Back, Instructor! 👋</h1>
        <p style={styles.subheading}>Manage your educational content and track student progress</p>
      </div>

      {/* Feature Cards */}
      <div style={styles.grid}>
        {features.map((feature, index) => (
          <Link key={index} to={feature.path} style={styles.cardLink}>
            <div style={styles.card}>
              <div style={styles.iconWrap}>{feature.icon}</div>
              <h3 style={styles.cardTitle}>{feature.title}</h3>
              <p style={styles.cardDesc}>{feature.description}</p>
              <div style={styles.arrow}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '16px',
    padding: '2.5rem 2rem',
    marginBottom: '2rem',
    color: 'white',
    textAlign: 'center',
  },
  heading: { fontSize: '2.2rem', fontWeight: '700', margin: 0 },
  subheading: { fontSize: '1.05rem', opacity: 0.85, marginTop: '0.5rem', marginBottom: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  cardLink: { textDecoration: 'none' },
  card: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '1.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  iconWrap: {
    fontSize: '2.5rem',
    backgroundColor: '#eff6ff',
    borderRadius: '50%',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  cardTitle: { fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.5rem' },
  cardDesc: { fontSize: '0.9rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 1rem' },
  arrow: { color: '#3b82f6', fontWeight: '700', fontSize: '1.1rem' },
};

export default InstructorDashboard;