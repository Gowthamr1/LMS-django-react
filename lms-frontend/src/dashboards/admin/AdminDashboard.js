import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Administrative Control Panel</p>
      </header>
      
      <div style={styles.grid}>
        <DashboardCard 
          to="/admin/users" 
          icon="👤" 
          title="User Management" 
          description="Manage user accounts and roles"
        />
        <DashboardCard 
          to="/admin/courses" 
          icon="📚" 
          title="Course Management" 
          description="Manage and remove courses"
        />
        <DashboardCard 
          to="/admin/stats" 
          icon="📈" 
          title="Analytics" 
          description="Platform statistics & insights"
        />
        <DashboardCard 
          to="/admin/permissions" 
          icon="🔐" 
          title="Access Control" 
          description="Manage permissions & security"
        />
        <DashboardCard 
          to="/admin/manage-reviews" 
          icon="📝" 
          title="Reviews Moderation" 
          description="Manage user-generated content"
        />

        <DashboardCard 
    to="/admin/create-course" 
    icon="📘" 
    title="Create Course" 
    description="Develop new courses and structure curriculum"
      />
      <DashboardCard 
    to="/admin/create-lesson" 
    icon="🎬" 
    title="Upload Lesson" 
    description="Add lessons, videos, and materials"
      />

      </div>
    </div>
  );
}

const DashboardCard = ({ to, icon, title, description }) => (
  <Link to={to} style={styles.cardLink}>
    <div style={styles.card}>
      <div style={styles.cardIcon}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardDescription}>{description}</p>
    </div>
  </Link>
);

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#7f8c8d',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '1.5rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  cardIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    margin: '0 0 0.5rem 0',
    color: '#34495e',
  },
  cardDescription: {
    fontSize: '0.95rem',
    color: '#7f8c8d',
    lineHeight: '1.4',
    margin: 0,
  },
};

export default AdminDashboard;