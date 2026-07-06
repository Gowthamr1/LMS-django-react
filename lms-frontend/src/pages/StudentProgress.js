import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';

function StudentProgress() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/enrollments/')
      .then(res => setEnrollments(res.data || []))
      .catch(err => { console.error('Failed to load enrollments:', err); setEnrollments([]); })
      .finally(() => setLoading(false));
  }, []);

  const totalCompleted = enrollments.filter(e => e.completed).length;
  const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + (e.completed_lessons || 0), 0);

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>📊 Learning Progress</h1>
          <p style={styles.subheading}>Track your academic journey</p>
        </div>
        {!loading && enrollments.length > 0 && (
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statVal}>{enrollments.length}</div>
              <div style={styles.statLabel}>Enrolled</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <div style={styles.statVal}>{totalCompleted}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <div style={styles.statVal}>{totalLessonsCompleted}</div>
              <div style={styles.statLabel}>Lessons Done</div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : enrollments.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>🌱</div>
          <h3 style={styles.emptyTitle}>No courses enrolled yet</h3>
          <p style={styles.emptyText}>Start your learning adventure!</p>
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
                {/* Header */}
                <div style={styles.cardTop}>
                  <div style={styles.courseIcon}>📚</div>
                  <div style={styles.cardMeta}>
                    <h3 style={styles.courseTitle}>{enroll.course_title}</h3>
                    <span style={{
                      ...styles.badge,
                      ...(enroll.completed ? styles.badgeDone : styles.badgeProgress)
                    }}>
                      {enroll.completed ? '✅ Completed' : '📖 In Progress'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={styles.progressSection}>
                  <div style={styles.progressLabelRow}>
                    <span style={styles.progressLabel}>
                      {enroll.completed_lessons}/{enroll.total_lessons} lessons
                    </span>
                    <span style={{ ...styles.progressPct, color: progressColor }}>{pct}%</span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${pct}%`,
                      backgroundColor: progressColor,
                    }}></div>
                  </div>
                </div>

                {/* Details */}
                <div style={styles.details}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>🕒 Last accessed</span>
                    <span style={styles.detailValue}>
                      {enroll.last_accessed
                        ? formatDistanceToNow(parseISO(enroll.last_accessed), { addSuffix: true })
                        : 'Never'}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>🗓 Enrolled</span>
                    <span style={styles.detailValue}>
                      {new Date(enroll.enrolled_on).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {enroll.first_lesson_id ? (
                  <Link to={`/lesson/${enroll.first_lesson_id}`} style={styles.continueBtn}>
                    {enroll.completed ? '🔁 Review' : '▶ Continue'}
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
    alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem',
  },
  heading: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.25rem 0 0', fontSize: '1rem' },
  statsRow: {
    display: 'flex', alignItems: 'center', gap: '1.25rem',
    backgroundColor: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px',
  },
  statBox: { textAlign: 'center' },
  statVal: { fontSize: '1.75rem', fontWeight: '800', lineHeight: 1 },
  statLabel: { fontSize: '0.75rem', opacity: 0.85, marginTop: '0.2rem', textTransform: 'uppercase' },
  statDivider: { width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.3)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  card: {
    backgroundColor: 'white', borderRadius: '14px', padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '1.1rem',
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: '0.9rem' },
  courseIcon: {
    width: '44px', height: '44px', backgroundColor: '#e0f2fe', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
  },
  cardMeta: { flex: 1 },
  courseTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.4rem' },
  badge: { fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '6px' },
  badgeDone: { backgroundColor: '#dcfce7', color: '#166534' },
  badgeProgress: { backgroundColor: '#e0f2fe', color: '#0369a1' },
  progressSection: {},
  progressLabelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' },
  progressLabel: { fontSize: '0.8rem', color: '#64748b', fontWeight: '600' },
  progressPct: { fontSize: '0.8rem', fontWeight: '700' },
  progressTrack: { height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' },
  details: { borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' },
  detailRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
  detailLabel: { fontSize: '0.82rem', color: '#94a3b8' },
  detailValue: { fontSize: '0.82rem', color: '#374151', fontWeight: '600' },
  continueBtn: {
    display: 'block', textAlign: 'center', padding: '0.7rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem',
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

export default StudentProgress;