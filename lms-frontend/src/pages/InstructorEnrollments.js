import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

function InstructorEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/enrollments/')
      .then(res => setEnrollments(res.data))
      .catch(err => { console.error('Failed to load enrollments:', err); setEnrollments([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>👥 Student Enrollments</h1>
          <p style={styles.subheading}>Students enrolled in your courses</p>
        </div>
        {!loading && (
          <div style={styles.countBadge}>{enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''}</div>
        )}
      </div>

      {loading ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : enrollments.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No enrollments yet</h3>
          <p style={styles.emptyText}>Students who enroll in your courses will appear here.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {enrollments.map(e => (
            <div key={e.id} style={styles.card}>
              {/* Avatar */}
              <div style={styles.avatar}>
                {(e.student?.[0] || '?').toUpperCase()}
              </div>
              <div style={styles.cardBody}>
                <div style={styles.studentName}>{e.student}</div>
                <div style={styles.courseName}>{e.course_title || `Course #${e.course}`}</div>
              </div>
              <div style={styles.meta}>
                <div style={styles.metaLabel}>Enrolled on</div>
                <div style={styles.metaValue}>
                  {new Date(e.enrolled_on).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div style={{ ...styles.statusBadge, ...(e.completed ? styles.statusDone : styles.statusProgress) }}>
                {e.completed ? '✅ Completed' : '📖 In Progress'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '900px', margin: '0 auto', padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc', minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem',
    color: 'white', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
  },
  heading: { fontSize: '1.9rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.25rem 0 0', fontSize: '1rem' },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1.25rem',
    borderRadius: '20px', fontWeight: '700', fontSize: '1rem',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: {
    backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex',
    alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
  },
  avatar: {
    width: '46px', height: '46px', borderRadius: '50%',
    backgroundColor: '#eff6ff', color: '#3b82f6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', fontWeight: '700', flexShrink: 0,
  },
  cardBody: { flex: 1, minWidth: '140px' },
  studentName: { fontWeight: '700', color: '#1e293b', fontSize: '1rem' },
  courseName: { color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' },
  meta: { textAlign: 'right', flexShrink: 0 },
  metaLabel: { color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' },
  metaValue: { color: '#374151', fontSize: '0.9rem', fontWeight: '600', marginTop: '0.15rem' },
  statusBadge: { padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', flexShrink: 0 },
  statusDone: { backgroundColor: '#dcfce7', color: '#166534' },
  statusProgress: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
  emptyBox: {
    backgroundColor: 'white', borderRadius: '14px', padding: '4rem 2rem',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.5rem', color: '#1e293b', margin: '0 0 0.5rem' },
  emptyText: { color: '#64748b' },
  center: { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner: {
    width: '48px', height: '48px', border: '5px solid #e2e8f0',
    borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
};

export default InstructorEnrollments;