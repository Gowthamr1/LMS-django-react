import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

function InstructorReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    axiosInstance.get('/api/courses/reviews/')
      .then(res => {
        setReviews(res.data);
        const total = res.data.reduce((sum, r) => sum + r.rating, 0);
        setAverageRating(res.data.length ? (total / res.data.length).toFixed(1) : 0);
      })
      .catch(err => { console.error('Failed to fetch reviews:', err); setReviews([]); })
      .finally(() => setLoading(false));
  }, []);

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#22c55e';
    if (rating >= 3) return '#eab308';
    return '#ef4444';
  };

  const renderStars = (rating) =>
    [1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= rating ? '#fbbf24' : '#e2e8f0', fontSize: '1rem' }}>★</span>
    ));

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>⭐ Course Reviews</h1>
          <p style={styles.subheading}>See what your students are saying</p>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <div style={styles.statValue}>{reviews.length}</div>
            <div style={styles.statLabel}>Total Reviews</div>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: getRatingColor(averageRating) }}>
              {averageRating}
            </div>
            <div style={styles.statLabel}>Avg Rating / 5</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.center}>
          <div style={styles.spinner}></div>
        </div>
      ) : reviews.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>💬</div>
          <h3 style={styles.emptyTitle}>No reviews yet</h3>
          <p style={styles.emptyText}>Share your courses with students to start collecting feedback.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {reviews.map(review => (
            <div key={review.id} style={styles.card}>
              {/* Top row */}
              <div style={styles.cardTop}>
                <div style={styles.avatar}>
                  {(review.student?.[0] || '?').toUpperCase()}
                </div>
                <div style={styles.cardMeta}>
                  <div style={styles.studentName}>{review.student}</div>
                  <div style={styles.courseName}>{review.course_title}</div>
                </div>
                <div style={{ ...styles.ratingBadge, backgroundColor: getRatingColor(review.rating) }}>
                  {review.rating}/5
                </div>
              </div>

              {/* Stars */}
              <div style={styles.stars}>{renderStars(review.rating)}</div>

              {/* Comment */}
              <p style={styles.comment}>
                "{review.comment || 'No comment provided'}"
              </p>

              {/* Footer */}
              <div style={styles.cardFooter}>
                <span style={styles.date}>
                  🗓 {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </span>
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
    maxWidth: '1200px', margin: '0 auto', padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc', minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem',
    color: 'white', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem',
  },
  heading: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.25rem 0 0', fontSize: '1rem' },
  statsRow: {
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '1rem 1.75rem', borderRadius: '12px',
  },
  statBox: { textAlign: 'center' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: 'white', lineHeight: 1 },
  statLabel: { fontSize: '0.78rem', opacity: 0.85, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statDivider: { width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.3)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white', borderRadius: '14px',
    padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.9rem' },
  avatar: {
    width: '42px', height: '42px', borderRadius: '50%',
    backgroundColor: '#eff6ff', color: '#3b82f6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', fontWeight: '700', flexShrink: 0,
  },
  cardMeta: { flex: 1, minWidth: 0 },
  studentName: { fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' },
  courseName: { color: '#64748b', fontSize: '0.8rem', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  ratingBadge: {
    color: 'white', padding: '0.25rem 0.65rem',
    borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', flexShrink: 0,
  },
  stars: { display: 'flex', gap: '2px' },
  comment: {
    color: '#475569', lineHeight: 1.6, fontSize: '0.9rem',
    fontStyle: 'italic', margin: 0,
    borderLeft: '3px solid #e0e7ff', paddingLeft: '0.75rem',
  },
  cardFooter: {
    borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto',
  },
  date: { color: '#94a3b8', fontSize: '0.8rem' },
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

export default InstructorReviews;