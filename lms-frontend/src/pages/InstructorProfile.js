import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import ChangePassword from '../components/ChangePassword';

function InstructorProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ courses: 0, students: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [userRes, courseRes, enrollmentRes] = await Promise.all([
        axiosInstance.get('/api/users/me/'),
        axiosInstance.get('/api/courses/courses/'),
        axiosInstance.get('/api/courses/enrollments/'),
      ]);
      setProfile(userRes.data);

      // The backend already scopes both endpoints to the signed-in instructor.
      // CourseSerializer does not include reverse enrollment relations, so use
      // the enrollment endpoint rather than always showing a false zero.
      setStats({
        courses: courseRes.data.length,
        students: enrollmentRes.data.length,
      });
    } catch (err) {
      console.error('Failed to load instructor profile info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Your Profile...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header — matches Student Profile gradient layout */}
      <div style={styles.header}>
        <h1 style={styles.title}>👩‍🏫 Instructor Profile</h1>
        <div style={styles.profileCard}>
          {profile ? (
            <>
              <div style={styles.avatar}>
                {profile.username[0].toUpperCase()}
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.username}>{profile.username}</h2>
                <p style={styles.meta}>
                  <span style={styles.label}>📧 Email:</span> {profile.email || 'N/A'}
                </p>
                <p style={styles.meta}>
                  <span style={styles.label}>🎭 Role:</span>{' '}
                  <span style={styles.role}>{profile.role}</span>
                </p>
                <p style={styles.meta}>
                  <span style={styles.label}>📅 Joined:</span>{' '}
                  {new Date(profile.date_joined || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </>
          ) : (
            <p style={styles.error}>No profile data found 🔍</p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statValue}>{stats.courses}</div>
          <div style={styles.statLabel}>Courses Created</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statValue}>{stats.students}</div>
          <div style={styles.statLabel}>Enrolled Students</div>
        </div>
      </div>

      <ChangePassword />

      {/* Refresh */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={fetchProfile} style={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '2rem',
    padding: '2rem',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  title: {
    color: 'white',
    fontSize: '2.5rem',
    marginBottom: '1rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    gap: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#0ea5e9',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    flexShrink: 0
  },
  profileInfo: {
    flex: 1
  },
  username: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    color: '#1f2937'
  },
  meta: {
    fontSize: '1.1rem',
    color: '#4b5563',
    margin: '0.5rem 0'
  },
  label: {
    fontWeight: '600',
    color: '#374151'
  },
  role: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.9rem'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  statIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem'
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.25rem'
  },
  statLabel: {
    fontSize: '1rem',
    color: '#6b7280'
  },
  refreshButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '600'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e5e7eb',
    borderTopColor: '#0ea5e9',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    fontSize: '1.2rem',
    color: '#4b5563',
    fontStyle: 'italic'
  },
  error: {
    color: '#6b7280',
    fontSize: '1.1rem'
  }
};

export default InstructorProfile;
