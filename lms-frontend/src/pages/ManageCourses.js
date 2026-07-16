import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/courses/')
      .then(res => setCourses(res.data))
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>My Courses</h1>
          <p style={styles.subheading}>Create and manage your course content</p>
        </div>
        <Link to="/instructor/create-course" style={styles.createButton}>
          ➕ New Course
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>⚠️ {error}</div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={styles.emptyBox}>
          <div style={styles.spinner}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : courses.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No courses yet</h3>
          <p style={styles.emptyText}>Start by creating your first course!</p>
          <Link to="/instructor/create-course" style={styles.createButton}>
            ➕ Create First Course
          </Link>
        </div>
      ) : (
        <>
          <p style={styles.courseCount}>{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
          <div style={styles.grid}>
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                style={styles.card}
              >
                {/* Course Image */}
                <div style={styles.imageContainer}>
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      style={styles.image}
                    />
                  ) : (
                    <div style={styles.imagePlaceholder}>
                      <span style={styles.placeholderIcon}>📚</span>
                    </div>
                  )}
                  <div style={styles.priceBadge}>
                    ${parseFloat(course.price || 0).toFixed(2)}
                  </div>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>
                  <h3 style={styles.courseTitle}>{course.title}</h3>
                  <p style={styles.courseDesc}>
                    {course.description
                      ? course.description.length > 100
                        ? course.description.slice(0, 100) + '…'
                        : course.description
                      : 'No description provided'}
                  </p>

                  <div style={styles.meta}>
                    <span style={styles.metaItem}>
                      ⏱ {course.duration}
                    </span>
                    <span style={styles.metaItem}>
                      🎯 {course.difficulty}
                    </span>
                    <span style={styles.metaItem}>
                      📅 {new Date(course.created_at).toLocaleDateString()}
                    </span>
                    <span style={styles.metaItem}>
                      📖 {course.lessons?.length ?? 0} lesson{course.lessons?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div style={styles.cardFooter}>
                  <Link
                    to={`/instructor/manage-lessons/${course.id}`}
                    style={styles.manageButton}
                  >
                    📖 Manage Lessons
                  </Link>
                  <Link
                    to={`/instructor/create-lesson?courseId=${course.id}`}
                    style={styles.addLessonButton}
                  >
                    ➕ Add Lesson
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '2rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '16px',
    color: 'white'
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: 0,
    color: 'white'
  },
  subheading: {
    margin: '0.25rem 0 0',
    opacity: 0.85,
    fontSize: '1rem'
  },
  createButton: {
    backgroundColor: 'white',
    color: '#3b82f6',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap'
  },
  courseCount: {
    color: '#64748b',
    fontSize: '0.95rem',
    marginBottom: '1rem',
    paddingLeft: '0.25rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s'
  },
  imageContainer: {
    position: 'relative',
    height: '180px'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderIcon: {
    fontSize: '3.5rem'
  },
  priceBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(0,0,0,0.65)',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  cardBody: {
    padding: '1.25rem',
    flex: 1
  },
  courseTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.5rem'
  },
  courseDesc: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: 1.55,
    margin: '0 0 1rem'
  },
  meta: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  metaItem: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px'
  },
  cardFooter: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    gap: '0.75rem'
  },
  manageButton: {
    flex: 1,
    textAlign: 'center',
    padding: '0.6rem 0',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  addLessonButton: {
    flex: 1,
    textAlign: 'center',
    padding: '0.6rem 0',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem'
  },
  emptyBox: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '4rem 2rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    color: '#1e293b',
    margin: '0 0 0.5rem'
  },
  emptyText: {
    color: '#64748b',
    marginBottom: '1.5rem'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '5px solid #e2e8f0',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  }
};

export default ManageCourses;
