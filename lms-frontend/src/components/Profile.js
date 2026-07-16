import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import ChangePassword from './ChangePassword';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/api/users/me/'),
      axiosInstance.get('/api/courses/enrollments/'),
    ])
      .then(([profileRes, enrollRes]) => {
        setProfile(profileRes.data);
        setEnrollments(enrollRes.data);
      })
      .catch(err => console.error('❌ Error fetching data:', err))
      .finally(() => setLoading(false));
  }, []);

  const completedCount = enrollments.filter(e => e.completed).length;
  const inProgressCount = enrollments.length - completedCount;

  if (loading) return (
    <div style={styles.loadingPage}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading your profile...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header / Profile Card */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>🎓 My Profile</h1>
        <div style={styles.profileCard}>
          {profile ? (
            <>
              <div style={styles.avatar}>
                {profile.username[0].toUpperCase()}
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.username}>{profile.username}</h2>
                <p style={styles.meta}><span style={styles.metaLabel}>📧 Email:</span> {profile.email}</p>
                <p style={styles.meta}><span style={styles.metaLabel}>🎭 Role:</span> <span style={styles.roleBadge}>{profile.role}</span></p>
              </div>
            </>
          ) : (
            <p style={{ color: '#64748b' }}>No profile data found.</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statValue}>{enrollments.length}</div>
          <div style={styles.statLabel}>Enrolled</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statValue}>{completedCount}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📖</div>
          <div style={styles.statValue}>{inProgressCount}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
      </div>

      <ChangePassword />

      {/* Enrollments */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📖 My Enrollments</h2>
        {enrollments.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>😕</div>
            <p style={styles.emptyText}>No courses enrolled yet</p>
            <Link to="/student/browse" style={styles.browseBtn}>Browse Courses →</Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {enrollments.map(enroll => {
              const pct = enroll.total_lessons > 0
                ? Math.round((enroll.completed_lessons / enroll.total_lessons) * 100) : 0;
              return (
                <div key={enroll.id} style={styles.courseCard}>
                  <div style={styles.courseCardTop}>
                    <div style={styles.courseIcon}>📘</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.courseTitle}>{enroll.course_title}</h3>
                      <p style={styles.enrollDate}>
                        🗓 {new Date(enroll.enrolled_on).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ ...styles.badge, ...(enroll.completed ? styles.badgeDone : styles.badgeProgress) }}>
                      {enroll.completed ? 'Done' : `${pct}%`}
                    </span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${pct}%`,
                      backgroundColor: enroll.completed ? '#22c55e' : '#06b6d4',
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1200px', margin: '0 auto', padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc', minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', color: 'white',
  },
  pageTitle: { fontSize: '2rem', fontWeight: '700', margin: '0 0 1.25rem' },
  profileCard: {
    backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
  avatar: {
    width: '70px', height: '70px', borderRadius: '50%',
    backgroundColor: '#06b6d4', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', fontWeight: '800', flexShrink: 0,
  },
  profileInfo: { flex: 1 },
  username: { fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.4rem' },
  meta: { fontSize: '1rem', color: '#4b5563', margin: '0.3rem 0' },
  metaLabel: { fontWeight: '700', color: '#374151' },
  roleBadge: {
    backgroundColor: '#e0f2fe', color: '#0369a1',
    padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem',
  },
  statCard: {
    backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: '#1e293b', lineHeight: 1 },
  statLabel: { fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' },
  section: {
    backgroundColor: 'white', borderRadius: '14px', padding: '1.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  sectionTitle: {
    fontSize: '1.4rem', fontWeight: '700', color: '#1e293b',
    margin: '0 0 1.25rem', paddingBottom: '1rem', borderBottom: '2px solid #f1f5f9',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  courseCard: {
    backgroundColor: '#f8fafc', borderRadius: '10px', padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  courseCardTop: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  courseIcon: {
    width: '38px', height: '38px', backgroundColor: '#e0f2fe', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
  },
  courseTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.2rem' },
  enrollDate: { fontSize: '0.78rem', color: '#94a3b8', margin: 0 },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', flexShrink: 0 },
  badgeDone: { backgroundColor: '#dcfce7', color: '#166534' },
  badgeProgress: { backgroundColor: '#e0f2fe', color: '#0369a1' },
  progressTrack: { height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
  emptyBox: { textAlign: 'center', padding: '2.5rem' },
  emptyIcon: { fontSize: '3rem', marginBottom: '0.75rem' },
  emptyText: { color: '#64748b', fontSize: '1.1rem', marginBottom: '1rem' },
  browseBtn: {
    display: 'inline-block', padding: '0.65rem 1.5rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '700',
  },
  loadingPage: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc',
  },
  spinner: {
    width: '50px', height: '50px', border: '5px solid #e2e8f0',
    borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem',
  },
  loadingText: { color: '#64748b', fontSize: '1.1rem', fontStyle: 'italic' },
};

export default Profile;
