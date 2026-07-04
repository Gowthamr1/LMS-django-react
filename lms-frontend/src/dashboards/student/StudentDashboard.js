import React from 'react';
import { Link } from 'react-router-dom';

function StudentDashboard() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚀 Learning Dashboard</h1>
        <p style={styles.subtitle}>Ready for your next learning adventure?</p>
      </div>

      <div style={styles.grid}>
        <Link to="/student/browse" style={styles.card}>
          <div style={styles.cardContent}>
            <div style={styles.icon}>📚</div>
            <h3 style={styles.cardTitle}>Browse Courses</h3>
            <p style={styles.cardText}>Explore new subjects and skills</p>
          </div>
        </Link>

        <Link to="/student/lessons" style={styles.card}>
          <div style={styles.cardContent}>
            <div style={styles.icon}>🎮</div>
            <h3 style={styles.cardTitle}>Continue Lessons</h3>
            <p style={styles.cardText}>Pick up where you left off</p>
          </div>
        </Link>

        <Link to="/student/progress" style={styles.card}>
          <div style={styles.cardContent}>
            <div style={styles.icon}>📈</div>
            <h3 style={styles.cardTitle}>Track Progress</h3>
            <p style={styles.cardText}>See your learning journey</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '2rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '15px',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.9
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    padding: '1rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    textDecoration: 'none',
    color: '#1f2937',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)'
    }
  },
  cardContent: {
    textAlign: 'center'
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    transition: 'transform 0.2s'
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#1e40af'
  },
  cardText: {
    color: '#6b7280',
    fontSize: '1rem'
  }
};

export default StudentDashboard;