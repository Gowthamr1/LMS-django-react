import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

function ManageLessons() {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await axiosInstance.get(`/api/courses/courses/${courseId}/`);
        setCourseTitle(courseRes.data.title);
        const lessonsRes = await axiosInstance.get('/api/courses/lessons/');
        setLessons(lessonsRes.data.filter(l => l.course === parseInt(courseId)));
      } catch (err) {
        console.error('Failed to load lessons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>📖 Manage Lessons</h1>
          <p style={styles.subheading}>{courseTitle || 'Loading course...'}</p>
        </div>
        <Link to={`/instructor/create-lesson`} style={styles.addButton}>
          ➕ Add Lesson
        </Link>
      </div>

      {loading ? (
        <div style={styles.center}>
          <div style={styles.spinner}></div>
        </div>
      ) : lessons.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No lessons yet</h3>
          <p style={styles.emptyText}>Start adding lessons to this course.</p>
          <Link to="/instructor/create-lesson" style={styles.addButton}>➕ Add First Lesson</Link>
        </div>
      ) : (
        <div style={styles.list}>
          {lessons
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((lesson, index) => (
              <div key={lesson.id} style={styles.card}>
                <div style={styles.orderBadge}>{lesson.order}</div>
                <div style={styles.cardBody}>
                  <h3 style={styles.lessonTitle}>{lesson.title}</h3>
                  {lesson.content && (
                    <p style={styles.lessonPreview}>
                      {lesson.content.length > 120
                        ? lesson.content.slice(0, 120) + '…'
                        : lesson.content}
                    </p>
                  )}
                  <div style={styles.badges}>
                    {lesson.video && <span style={styles.badge}>🎬 Video</span>}
                    {lesson.image && <span style={styles.badge}>🖼️ Image</span>}
                  </div>
                </div>
                <div style={styles.lessonIndex}>#{index + 1}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  heading: { fontSize: '1.9rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.25rem 0 0', fontSize: '1rem' },
  addButton: {
    backgroundColor: 'white',
    color: '#3b82f6',
    padding: '0.7rem 1.4rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.25rem',
  },
  orderBadge: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    borderRadius: '10px',
    padding: '0.4rem 0.75rem',
    fontWeight: '700',
    fontSize: '1rem',
    flexShrink: 0,
    marginTop: '2px',
  },
  cardBody: { flex: 1 },
  lessonTitle: { fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.4rem' },
  lessonPreview: { fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.6rem' },
  badges: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  badge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  lessonIndex: { color: '#cbd5e1', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0 },
  emptyBox: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '4rem 2rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.5rem', color: '#1e293b', margin: '0 0 0.5rem' },
  emptyText: { color: '#64748b', marginBottom: '1.5rem' },
  center: { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner: {
    width: '48px', height: '48px',
    border: '5px solid #e2e8f0',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default ManageLessons;