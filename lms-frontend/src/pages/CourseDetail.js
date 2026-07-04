import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourse = async () => {
      try {
        // axiosInstance now automatically attaches the token via interceptor
        const response = await axiosInstance.get(`/api/courses/courses/${id}/`);
        setCourse(response.data);
      } catch (err) {
        console.error('Error loading course:', err);
        setMessage('🚨 Failed to load course details');
      }
    };
    loadCourse();
  }, [id]);

  const handleEnroll = () => {
    navigate(`/student/payments/${id}`);
  };

  if (!course) return (
    <div style={styles.loading}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Course Universe...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Course Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.categoryBadge}>
            📚 {course.category || 'General Education'}
          </div>
          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.excerpt}>{course.short_description}</p>
          <div style={styles.metaContainer}>
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>⏳</span>
              {course.duration || '6 Weeks'}
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>🎯</span>
              {course.difficulty || 'Beginner'}
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>👨🏫</span>
              {course.instructor_name || 'Expert Instructor'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.contentGrid}>
        <div style={styles.mainContent}>
          <h2 style={styles.sectionTitle}>📖 Course Description</h2>
          <p style={styles.description}>{course.description}</p>

          <h2 style={styles.sectionTitle}>📚 Course Syllabus</h2>
          <div style={styles.syllabus}>
            {(course.lessons || []).map((lesson, index) => (
              <div key={lesson.id} style={styles.lessonCard}>
                <div style={styles.lessonNumber}>📌 Lesson {index + 1}</div>
                <h3 style={styles.lessonTitle}>{lesson.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.enrollmentCard}>
            {course.is_enrolled ? (
              <div style={styles.enrolledBadge}>
                🎉 Already Enrolled
                <button
                  style={styles.startLearningButton}
                  onClick={() => navigate(`/lesson/${course.lessons[0]?.id}`)}
                >
                  Start Learning Now 🚀
                </button>
              </div>
            ) : (
              <>
                <div style={styles.priceContainer}>
                  <span style={styles.price}>${course.price || '0.00'}</span>
                  <span style={styles.priceNote}>one-time payment</span>
                </div>
                <button style={styles.enrollButton} onClick={handleEnroll}>
                  Enroll Now 🔒
                </button>
                <div style={styles.includesList}>
                  <div style={styles.includesItem}>✅ Lifetime Access</div>
                  <div style={styles.includesItem}>✅ Certificate of Completion</div>
                  <div style={styles.includesItem}>✅ 24/7 Support</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div style={styles.message}>{message}</div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#f8fafc'
  },
  hero: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
    color: 'white',
    padding: '4rem 2rem',
    borderBottomLeftRadius: '30px',
    borderBottomRightRadius: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center'
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '0.5rem 1.5rem',
    borderRadius: '20px',
    display: 'inline-block',
    marginBottom: '1rem',
    fontSize: '0.9rem'
  },
  title: {
    fontSize: '2.5rem',
    margin: '1rem 0',
    lineHeight: 1.2
  },
  excerpt: {
    fontSize: '1.2rem',
    opacity: 0.9,
    marginBottom: '2rem'
  },
  metaContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.1rem'
  },
  metaIcon: {
    fontSize: '1.5rem'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '2rem',
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  mainContent: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#1f2937',
    margin: '2rem 0 1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #e5e7eb'
  },
  description: {
    color: '#4b5563',
    lineHeight: 1.7,
    fontSize: '1.1rem'
  },
  syllabus: {
    display: 'grid',
    gap: '1.5rem'
  },
  lessonCard: {
    backgroundColor: '#f8fafc',
    padding: '1.5rem',
    borderRadius: '10px',
    borderLeft: '4px solid #4f46e5'
  },
  lessonNumber: {
    color: '#4f46e5',
    fontWeight: '600',
    marginBottom: '0.5rem'
  },
  lessonTitle: {
    fontSize: '1.2rem',
    margin: '0 0 0.5rem'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  enrollmentCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    position: 'sticky',
    top: '2rem'
  },
  priceContainer: {
    textAlign: 'center',
    marginBottom: '1.5rem'
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  priceNote: {
    display: 'block',
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  enrollButton: {
    width: '100%',
    padding: '1.2rem',
    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  enrolledBadge: {
    textAlign: 'center',
    color: '#166534',
    backgroundColor: '#dcfce7',
    padding: '1.5rem',
    borderRadius: '10px'
  },
  startLearningButton: {
    width: '100%',
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  includesList: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #e5e7eb'
  },
  includesItem: {
    padding: '0.5rem 0',
    color: '#374151'
  },
  message: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    backgroundColor: '#fffbeb',
    color: '#92400e',
    padding: '1rem 2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e5e7eb',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    fontSize: '1.2rem',
    color: '#4b5563',
    fontStyle: 'italic'
  }
};