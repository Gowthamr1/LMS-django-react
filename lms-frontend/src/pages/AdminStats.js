import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

function AdminStats() {
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    Promise.all([
      axiosInstance.get('/api/users/all/'),
      axiosInstance.get('/api/courses/courses/'),
      axiosInstance.get('/api/courses/enrollments/')
    ])
      .then(([userRes, courseRes, enrollRes]) => {
        setStats({
          users: userRes.data.length || 0,
          courses: courseRes.data.length,
          enrollments: enrollRes.data.length,
        });
        setLastUpdated(new Date().toLocaleTimeString());
        setError('');
      })
      .catch(err => {
        console.error('Failed to load stats:', err);
        setError('Failed to load some statistics. Showing available data.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Platform Analytics</h2>
        <div style={styles.controls}>
          <span style={styles.updateTime}>Last updated: {lastUpdated}</span>
          <button style={styles.refreshButton} onClick={fetchStats}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading statistics...</div>
      ) : (
        <>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.grid}>
            <StatCard 
              icon="👥"
              title="Total Users"
              value={stats.users}
              trend="+12% this month"
            />
            <StatCard
              icon="📚"
              title="Total Courses"
              value={stats.courses}
              trend="+3 new this week"
            />
            <StatCard
              icon="🎓"
              title="Total Enrollments"
              value={stats.enrollments}
              trend="24 active now"
            />
          </div>
        </>
      )}
    </div>
  );
}

const StatCard = ({ icon, title, value, trend }) => (
  <div style={styles.card}>
    <div style={styles.cardIcon}>{icon}</div>
    <div style={styles.cardContent}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <div style={styles.cardValue}>{value.toLocaleString()}</div>
      <div style={styles.cardTrend}>{trend}</div>
    </div>
  </div>
);

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    color: '#2c3e50',
    margin: 0
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#e9ecef'
    }
  },
  updateTime: {
    color: '#6c757d',
    fontSize: '0.9rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  cardIcon: {
    fontSize: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  cardContent: {
    flex: 1
  },
  cardTitle: {
    fontSize: '1rem',
    color: '#6c757d',
    margin: '0 0 0.25rem 0'
  },
  cardValue: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2c3e50'
  },
  cardTrend: {
    fontSize: '0.9rem',
    color: '#28a745',
    marginTop: '0.25rem'
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6c757d'
  },
  error: {
    padding: '1rem',
    marginBottom: '1.5rem',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '4px',
    border: '1px solid #ffeeba'
  }
};

export default AdminStats;