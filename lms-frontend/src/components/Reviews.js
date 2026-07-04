import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

const Reviews = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [reviews, setReviews] = useState({});
  const [messages, setMessages] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/enrollments/')
      .then(res => setEnrollments(res.data))
      .catch(err => console.error('Failed to fetch enrollments:', err))
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (courseId, field, value) => {
    setReviews(prev => ({ ...prev, [courseId]: { ...prev[courseId], [field]: value } }));
  };

  const handleSubmit = async (courseId) => {
    if (!reviews[courseId]?.text || !reviews[courseId]?.rating) return;
    setLoading(true);
    try {
      await axiosInstance.post('/api/courses/reviews/', {
        course: courseId,
        comment: reviews[courseId].text,
        rating: reviews[courseId].rating,
      });
      setMessages(prev => ({ ...prev, [courseId]: '✅ Review submitted!' }));
      setSubmitted(prev => ({ ...prev, [courseId]: true }));
    } catch (err) {
      setMessages(prev => ({ ...prev, [courseId]: '❌ Failed to submit review.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.heading}>⭐ Share Your Experience</h1>
        <p style={styles.subheading}>Your feedback helps other students and improves courses</p>
      </div>

      {fetching ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : enrollments.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📚</div>
          <h3 style={styles.emptyTitle}>No courses enrolled yet</h3>
          <p style={styles.emptyText}>Enroll in a course to leave a review!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {enrollments.map(enrollment => {
            const courseId = enrollment.course;
            const rating = Number(reviews[courseId]?.rating || 0);
            const isSubmitted = submitted[courseId];

            return (
              <div key={enrollment.id} style={styles.card}>
                {/* Course name */}
                <div style={styles.cardTop}>
                  <div style={styles.courseIcon}>📖</div>
                  <h3 style={styles.courseTitle}>{enrollment.course_title}</h3>
                </div>

                {isSubmitted ? (
                  <div style={styles.successBox}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                    <p style={styles.successText}>Review submitted! Thank you.</p>
                    <div style={styles.starsDisplay}>
                      {[1,2,3,4,5].map(i => (
                        <span key={i} style={{ color: i <= rating ? '#fbbf24' : '#e2e8f0', fontSize: '1.5rem' }}>★</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Star rating */}
                    <div style={styles.ratingSection}>
                      <label style={styles.label}>Your Rating</label>
                      <div style={styles.starsRow}>
                        {[1,2,3,4,5].map(num => (
                          <button key={num} type="button"
                            onClick={() => handleChange(courseId, 'rating', num.toString())}
                            style={styles.starBtn}>
                            <span style={{ fontSize: '2rem', color: num <= rating ? '#fbbf24' : '#e2e8f0' }}>★</span>
                          </button>
                        ))}
                        <span style={styles.ratingText}>
                          {rating > 0 ? `${rating}/5` : 'Not rated'}
                        </span>
                      </div>
                    </div>

                    {/* Text */}
                    <div style={styles.textSection}>
                      <label style={styles.label}>Your Review</label>
                      <textarea rows="4" style={styles.textarea}
                        placeholder="What did you love? What could be improved?"
                        value={reviews[courseId]?.text || ''}
                        onChange={e => handleChange(courseId, 'text', e.target.value)} />
                    </div>

                    {/* Submit */}
                    <div style={styles.cardFooter}>
                      <button
                        onClick={() => handleSubmit(courseId)}
                        disabled={loading || !reviews[courseId]?.text || !reviews[courseId]?.rating}
                        style={{
                          ...styles.submitBtn,
                          opacity: (loading || !reviews[courseId]?.text || !reviews[courseId]?.rating) ? 0.6 : 1,
                        }}>
                        🚀 Publish Review
                      </button>
                      {messages[courseId] && (
                        <span style={{
                          fontSize: '0.85rem', fontWeight: '600',
                          color: messages[courseId].startsWith('✅') ? '#166534' : '#991b1b',
                        }}>
                          {messages[courseId]}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '1100px', margin: '0 auto', padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc', minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem', color: 'white',
  },
  heading: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.25rem 0 0', fontSize: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  card: {
    backgroundColor: 'white', borderRadius: '14px', padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '1.25rem',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  courseIcon: {
    width: '40px', height: '40px', backgroundColor: '#e0f2fe', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
  },
  courseTitle: { fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' },
  ratingSection: {},
  starsRow: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  starBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', lineHeight: 1 },
  ratingText: { fontSize: '0.85rem', color: '#64748b', fontWeight: '600', marginLeft: '0.5rem' },
  starsDisplay: { display: 'flex', gap: '0.25rem', justifyContent: 'center', marginTop: '0.5rem' },
  textSection: {},
  textarea: {
    width: '100%', padding: '0.85rem', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical',
    fontFamily: 'inherit', boxSizing: 'border-box',
  },
  cardFooter: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  submitBtn: {
    padding: '0.7rem 1.5rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', border: 'none', borderRadius: '8px',
    fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem',
  },
  successBox: {
    backgroundColor: '#f0fdf4', borderRadius: '10px', padding: '1.5rem',
    textAlign: 'center', border: '1px solid #bbf7d0',
  },
  successText: { color: '#166534', fontWeight: '600', margin: 0 },
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
    borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
};

export default Reviews;