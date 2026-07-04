import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';

function StudentLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let enrolledCourseIds = [];

    axiosInstance.get('/api/courses/enrollments/')
      .then(res => {
        enrolledCourseIds = res.data.map(e => e.course);
        return axiosInstance.get('/api/courses/lessons/');
      })
      .then(res => {
        const filtered = res.data.filter(l => enrolledCourseIds.includes(l.course));
        setLessons(filtered);
      })
      .catch(err => { console.error('Failed to load lessons:', err); setLessons([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.header}>
        <h1 style={styles.heading}>🚀 Continue Learning</h1>
        <p style={styles.subheading}>Pick up where you left off</p>
      </div>

      {loading ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : lessons.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No lessons available</h3>
          <p style={styles.emptyText}>Enroll in a course to see your lessons here.</p>
          <Link to="/student/browse" style={styles.browseBtn}>Browse Courses →</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {lessons.map(lesson => {
            // lesson.progress is 0 or 100 from LessonSerializer.get_progress
            const done = lesson.progress === 100;
            return (
              <div key={lesson.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={done ? styles.iconDone : styles.iconPending}>
                    {done ? '✅' : '📖'}
                  </div>
                  <div style={styles.cardMeta}>
                    <h3 style={styles.lessonTitle}>{lesson.title}</h3>
                    <span style={done ? styles.badgeDone : styles.badgePending}>
                      {done ? 'Completed' : 'Not completed'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={styles.progressSection}>
                  <div style={styles.progressLabelRow}>
                    <span style={styles.progressLabel}>Completion</span>
                    <span style={{ ...styles.progressPct, color: done ? '#22c55e' : '#64748b' }}>
                      {done ? '100%' : '0%'}
                    </span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{
                      ...styles.progressFill,
                      width: done ? '100%' : '0%',
                      backgroundColor: done ? '#22c55e' : '#06b6d4',
                    }}></div>
                  </div>
                </div>

                <Link to={`/lesson/${lesson.id}`} style={done ? styles.reviewBtn : styles.continueBtn}>
                  {done ? '🔁 Review Lesson' : '▶ Start Lesson'}
                </Link>
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
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem', color: 'white',
  },
  heading: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.25rem 0 0', fontSize: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  card: {
    backgroundColor: 'white', borderRadius: '14px', padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '1.1rem',
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: '0.9rem' },
  iconDone: {
    width: '44px', height: '44px', backgroundColor: '#dcfce7', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
  },
  iconPending: {
    width: '44px', height: '44px', backgroundColor: '#e0f2fe', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
  },
  cardMeta: { flex: 1 },
  lessonTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.4rem' },
  badgeDone: {
    fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem',
    borderRadius: '6px', backgroundColor: '#dcfce7', color: '#166534',
  },
  badgePending: {
    fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem',
    borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#64748b',
  },
  progressSection: {},
  progressLabelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' },
  progressLabel: { fontSize: '0.8rem', color: '#64748b', fontWeight: '600' },
  progressPct: { fontSize: '0.8rem', fontWeight: '700' },
  progressTrack: { height: '7px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' },
  continueBtn: {
    display: 'block', textAlign: 'center', padding: '0.7rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem',
  },
  reviewBtn: {
    display: 'block', textAlign: 'center', padding: '0.7rem',
    backgroundColor: '#f0fdf4', color: '#166534',
    border: '1px solid #bbf7d0', borderRadius: '8px',
    textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem',
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

export default StudentLessons;