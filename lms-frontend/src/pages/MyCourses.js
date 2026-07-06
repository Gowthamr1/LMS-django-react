import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';

function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/enrollments/')
      .then(res => setEnrollments(res.data || []))
      .catch(err => { console.error('Failed to load enrollments:', err); setEnrollments([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>📚 My Learning Journey</h1>
          <p style={styles.subheading}>Pick up where you left off</p>
        </div>
        {!loading && (
          <div style={styles.countBadge}>
            {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
          </div>
        )}
      </div>

      {loading ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : enrollments.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>🎓</div>
          <h3 style={styles.emptyTitle}>No courses yet</h3>
          <p style={styles.emptyText}>Start learning by enrolling in a course!</p>
          <Link to="/student/browse" style={styles.browseBtn}>Browse Courses →</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {enrollments.map(enroll => {
            const pct = enroll.total_lessons > 0
              ? Math.round((enroll.completed_lessons / enroll.total_lessons) * 100)
              : 0;
            const progressColor = pct === 100 ? '#22c55e' : pct >= 50 ? '#06b6d4' : '#3b82f6';

            return (
              <div key={enroll.id} style={styles.card}>
                {/* Top */}
                <div style={styles.cardTop}>
                  <div style={styles.courseIcon}>📖</div>
                  <div style={styles.cardMeta}>
                    <h3 style={styles.courseTitle}>{enroll.course_title}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      ...(enroll.completed ? styles.statusDone : styles.statusProgress)
                    }}>
                      {enroll.completed ? '✅ Completed' : '📖 In Progress'}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div style={styles.progressSection}>
                  <div style={styles.progressLabelRow}>
                    <span style={styles.progressLabel}>Progress</span>
                    <span style={{ ...styles.progressPct, color: progressColor }}>{pct}%</span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: progressColor }}></div>
                  </div>
                  <div style={styles.lessonCount}>
                    {enroll.completed_lessons} / {enroll.total_lessons} lessons complete
                  </div>
                </div>

                {/* CTA */}
                {enroll.first_lesson_id ? (
                  <Link to={`/lesson/${enroll.first_lesson_id}`} style={styles.continueBtn}>
                    {enroll.completed ? '🔁 Review Course' : '▶ Continue Learning'}
                  </Link>
                ) : (
                  <span style={{ ...styles.continueBtn, opacity: 0.5, cursor: 'not-allowed' }}>
                    No lessons yet
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
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
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem',
    color: 'white', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
  },
  heading: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.25rem 0 0', fontSize: '1rem' },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1.25rem',
    borderRadius: '20px', fontWeight: '700', fontSize: '0.95rem',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white', borderRadius: '14px', padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '1.25rem',
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: '1rem' },
  courseIcon: {
    fontSize: '1.5rem', backgroundColor: '#e0f2fe', borderRadius: '10px',
    width: '44px', height: '44px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  cardMeta: { flex: 1 },
  courseTitle: { fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.4rem' },
  statusBadge: { fontSize: '0.78rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '6px' },
  statusDone: { backgroundColor: '#dcfce7', color: '#166534' },
  statusProgress: { backgroundColor: '#e0f2fe', color: '#0369a1' },
  progressSection: {},
  progressLabelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' },
  progressLabel: { fontSize: '0.82rem', color: '#64748b', fontWeight: '600' },
  progressPct: { fontSize: '0.82rem', fontWeight: '700' },
  progressTrack: {
    height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' },
  lessonCount: { fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.35rem' },
  continueBtn: {
    display: 'block', textAlign: 'center', padding: '0.7rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', borderRadius: '8px', textDecoration: 'none',
    fontWeight: '700', fontSize: '0.9rem',
  },
  emptyBox: {
    backgroundColor: 'white', borderRadius: '14px', padding: '4rem 2rem',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.5rem', color: '#1e293b', margin: '0 0 0.5rem' },
  emptyText: { color: '#64748b', marginBottom: '1.5rem' },
  browseBtn: {
    display: 'inline-block', padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '700',
  },
  center: { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner: {
    width: '48px', height: '48px', border: '5px solid #e2e8f0',
    borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
};

export default MyCourses;