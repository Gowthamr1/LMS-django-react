import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Star, Pencil, Trash2, X } from 'lucide-react';

// ── Animation variants (matches StudentDashboard) ──────────────────
const headerVariants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

// Cycled per-card accent, same idea as the icon colors on StudentDashboard
const ACCENTS = [
  { color: '#3b82f6', bg: '#eff6ff' },
  { color: '#6366f1', bg: '#eef2ff' },
  { color: '#06b6d4', bg: '#ecfeff' },
  { color: '#f59e0b', bg: '#fffbeb' },
];

const Reviews = () => {
  const [enrollments, setEnrollments] = useState([]);
  // Existing reviews the student has already submitted, keyed by course id
  const [existingReviews, setExistingReviews] = useState({});
  // Draft form state per course (used both for a new review and while editing)
  const [drafts, setDrafts] = useState({});
  // Whether the edit form is open for a given course (only relevant once a review exists)
  const [editing, setEditing] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/api/courses/enrollments/'),
      axiosInstance.get('/api/courses/reviews/'),
    ])
      .then(([enrollRes, reviewRes]) => {
        setEnrollments(enrollRes.data || []);
        const byCourse = {};
        (reviewRes.data || []).forEach(r => { byCourse[r.course] = r; });
        setExistingReviews(byCourse);
      })
      .catch(err => console.error('Failed to fetch enrollments/reviews:', err))
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (courseId, field, value) => {
    setDrafts(prev => ({ ...prev, [courseId]: { ...prev[courseId], [field]: value } }));
  };

  const startEdit = (courseId) => {
    const existing = existingReviews[courseId];
    setDrafts(prev => ({
      ...prev,
      [courseId]: { rating: String(existing.rating), text: existing.comment },
    }));
    setEditing(prev => ({ ...prev, [courseId]: true }));
    setMessages(prev => ({ ...prev, [courseId]: null }));
  };

  const cancelEdit = (courseId) => {
    setEditing(prev => ({ ...prev, [courseId]: false }));
  };

  const handleSubmit = async (courseId) => {
    const draft = drafts[courseId];
    if (!draft?.text || !draft?.rating) return;
    setLoading(true);
    const existing = existingReviews[courseId];

    try {
      let res;
      if (existing) {
        res = await axiosInstance.patch(`/api/courses/reviews/${existing.id}/`, {
          rating: draft.rating,
          comment: draft.text,
        });
      } else {
        res = await axiosInstance.post('/api/courses/reviews/', {
          course: courseId,
          comment: draft.text,
          rating: draft.rating,
        });
      }
      setExistingReviews(prev => ({ ...prev, [courseId]: res.data }));
      setEditing(prev => ({ ...prev, [courseId]: false }));
      setMessages(prev => ({ ...prev, [courseId]: existing ? 'Review updated!' : 'Review submitted!' }));
    } catch (err) {
      const detail = err.response?.data?.detail;
      setMessages(prev => ({ ...prev, [courseId]: detail || 'Failed to submit review.', error: true }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    const existing = existingReviews[courseId];
    if (!existing) return;
    if (!window.confirm('Delete your review for this course? This cannot be undone.')) return;

    setLoading(true);
    try {
      await axiosInstance.delete(`/api/courses/reviews/${existing.id}/`);
      setExistingReviews(prev => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
      setDrafts(prev => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
      setEditing(prev => ({ ...prev, [courseId]: false }));
      setMessages(prev => ({ ...prev, [courseId]: null }));
    } catch (err) {
      setMessages(prev => ({ ...prev, [courseId]: 'Failed to delete review.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* Header — fades in from top, same treatment as StudentDashboard */}
      <motion.div
        style={styles.header}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 style={styles.title}>⭐ Share Your Experience</h1>
        <p style={styles.subtitle}>Your feedback helps other students and improves courses</p>
      </motion.div>

      {fetching ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : enrollments.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📚</div>
          <h3 style={styles.emptyTitle}>No courses enrolled yet</h3>
          <p style={styles.emptyText}>Enroll in a course to leave a review!</p>
        </div>
      ) : (
        <motion.div
          style={styles.grid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[...enrollments]
            .sort((a, b) => {
              const aReviewed = existingReviews[a.course] ? 1 : 0;
              const bReviewed = existingReviews[b.course] ? 1 : 0;
              return aReviewed - bReviewed; // not-yet-reviewed first, reviewed sink to the end
            })
            .map((enrollment, i) => {
            const courseId = enrollment.course;
            const existing = existingReviews[courseId];
            const isEditing = !!editing[courseId];
            const draft = drafts[courseId] || {};
            const draftRating = Number(draft.rating || 0);
            const showForm = !existing || isEditing;
            const accent = ACCENTS[i % ACCENTS.length];
            const msg = messages[courseId];

            return (
              <motion.div
                key={enrollment.id}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  rotateX: 3,
                  rotateY: -3,
                  boxShadow: `0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.06), 0 20px 36px ${accent.color}33`,
                  transition: { duration: 0.25, ease: 'easeOut' },
                }}
                style={{ ...styles.card, border: `1px solid ${accent.color}22` }}
              >
                {/* Course name */}
                <div style={styles.cardTop}>
                  <div style={{ ...styles.courseIcon, backgroundColor: accent.bg }}>
                    <BookOpen size={20} color={accent.color} strokeWidth={2} />
                  </div>
                  <h3 style={styles.courseTitle}>{enrollment.course_title}</h3>
                  {existing && !isEditing && <span style={styles.reviewedBadge}>✓ Reviewed</span>}
                </div>

                <AnimatePresence mode="wait">
                  {!showForm ? (
                    /* Already reviewed — read-only view with Edit / Delete */
                    <motion.div
                      key="display"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={styles.reviewDisplay}
                    >
                      <div style={styles.starsDisplay}>
                        {[1,2,3,4,5].map(i2 => (
                          <Star key={i2} size={20}
                            color={i2 <= existing.rating ? '#f59e0b' : '#cbd5e1'}
                            fill={i2 <= existing.rating ? '#fbbf24' : 'none'}
                            strokeWidth={1.75} />
                        ))}
                      </div>
                      <p style={styles.reviewComment}>{existing.comment}</p>
                      {existing.created_at && (
                        <p style={styles.reviewDate}>
                          Reviewed on {new Date(existing.created_at).toLocaleDateString()}
                        </p>
                      )}
                      <div style={styles.reviewActions}>
                        <button onClick={() => startEdit(courseId)} style={styles.editBtn}>
                          <Pencil size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(courseId)} disabled={loading} style={styles.deleteBtn}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                      {msg && (
                        <span style={{ ...styles.message, color: msg.startsWith('Failed') ? '#991b1b' : '#166534' }}>
                          {msg}
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                    >
                      {/* Star rating */}
                      <div>
                        <label style={styles.label}>Your Rating</label>
                        <div style={styles.starsRow}>
                          {[1,2,3,4,5].map(num => (
                            <button key={num} type="button"
                              onClick={() => handleChange(courseId, 'rating', num.toString())}
                              style={styles.starBtn}>
                              <Star size={28}
                                color={num <= draftRating ? '#f59e0b' : '#cbd5e1'}
                                fill={num <= draftRating ? '#fbbf24' : 'none'}
                                strokeWidth={1.75} />
                            </button>
                          ))}
                          <span style={styles.ratingText}>
                            {draftRating > 0 ? `${draftRating}/5` : 'Not rated'}
                          </span>
                        </div>
                      </div>

                      {/* Text */}
                      <div>
                        <label style={styles.label}>Your Review</label>
                        <textarea rows="4" style={styles.textarea}
                          placeholder="What did you love? What could be improved?"
                          value={draft.text || ''}
                          onChange={e => handleChange(courseId, 'text', e.target.value)} />
                      </div>

                      {/* Submit */}
                      <div style={styles.cardFooter}>
                        <button
                          onClick={() => handleSubmit(courseId)}
                          disabled={loading || !draft.text || !draft.rating}
                          style={{
                            ...styles.submitBtn,
                            opacity: (loading || !draft.text || !draft.rating) ? 0.6 : 1,
                          }}>
                          {existing ? 'Save Changes' : 'Publish Review'}
                        </button>
                        {existing && (
                          <button onClick={() => cancelEdit(courseId)} style={styles.cancelBtn}>
                            <X size={14} /> Cancel
                          </button>
                        )}
                      </div>
                      {msg && (
                        <span style={{ ...styles.message, color: msg.startsWith('Failed') ? '#991b1b' : '#166534' }}>
                          {msg}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    perspective: '1200px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '3.25rem 2rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 12px 30px rgba(6,182,212,0.3)',
  },
  title: {
    fontSize: '2.6rem',
    marginBottom: '0.6rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.75rem',
    padding: '1rem',
    alignItems: 'start',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '18px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 12px rgba(0,0,0,0.06), 0 16px 28px rgba(0,0,0,0.08)',
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    transformStyle: 'preserve-3d',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' },
  courseIcon: {
    width: '42px', height: '42px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  courseTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', margin: 0, lineHeight: 1.35, flex: 1 },
  reviewedBadge: {
    fontSize: '0.72rem', fontWeight: '700', color: '#166534', backgroundColor: '#dcfce7',
    padding: '0.25rem 0.6rem', borderRadius: '999px', flexShrink: 0, whiteSpace: 'nowrap',
  },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' },
  starsRow: { display: 'flex', alignItems: 'center', gap: '0.15rem' },
  starBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', lineHeight: 1, display: 'flex' },
  ratingText: { fontSize: '0.85rem', color: '#64748b', fontWeight: '600', marginLeft: '0.5rem' },
  starsDisplay: { display: 'flex', gap: '0.15rem', justifyContent: 'center', marginTop: '0.25rem' },
  textarea: {
    width: '100%', padding: '0.85rem', border: '1px solid #e2e8f0',
    borderRadius: '10px', fontSize: '0.95rem', resize: 'vertical',
    fontFamily: 'inherit', boxSizing: 'border-box',
  },
  cardFooter: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  submitBtn: {
    padding: '0.7rem 1.5rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
  },
  cancelBtn: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.7rem 1.1rem', backgroundColor: 'white', color: '#64748b',
    border: '1px solid #e2e8f0', borderRadius: '10px',
    fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
  },
  reviewDisplay: {
    backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.5rem',
    textAlign: 'center', border: '1px solid #f1f5f9',
  },
  reviewComment: { color: '#374151', fontSize: '0.95rem', margin: '0.75rem 0', lineHeight: 1.6 },
  reviewDate: { color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.75rem' },
  reviewActions: { display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: '0.5rem' },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.5rem 1.1rem', backgroundColor: '#eff6ff', color: '#1d4ed8',
    border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem',
  },
  deleteBtn: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.5rem 1.1rem', backgroundColor: '#fef2f2', color: '#b91c1c',
    border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem',
  },
  message: { fontSize: '0.85rem', fontWeight: '600', display: 'block', marginTop: '0.5rem' },
  emptyBox: {
    backgroundColor: 'white', borderRadius: '16px', padding: '4rem 2rem',
    textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.5rem', color: '#1e293b', margin: '0 0 0.5rem' },
  emptyText: { color: '#6b7280' },
  center: { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner: {
    width: '48px', height: '48px', border: '5px solid #e2e8f0',
    borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
};

export default Reviews;