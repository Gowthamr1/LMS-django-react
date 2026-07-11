import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Target, GraduationCap, Lock, Sparkles,
  CheckCircle2, Star, MessageSquareText, Hash,
} from 'lucide-react';

const heroVariants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await axiosInstance.get(`/api/courses/courses/${id}/`);
        setCourse(response.data);
      } catch (err) {
        console.error('Error loading course:', err);
        setMessage('🚨 Failed to load course details');
      }
    };
    loadCourse();
  }, [id]);

  useEffect(() => {
    setReviewsLoading(true);
    axiosInstance.get(`/api/courses/reviews/?course=${id}`)
      .then(res => setReviews(res.data || []))
      .catch(err => console.error('Failed to load reviews:', err))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const handleEnroll = () => {
    navigate(`/student/payments/${id}`);
  };

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (!course) return (
    <div style={styles.loading}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Course Universe...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Course Hero Section */}
      <motion.div style={styles.hero} variants={heroVariants} initial="hidden" animate="visible">
        <div style={styles.heroContent}>
          <div style={styles.categoryBadge}>
            <BookOpen size={14} /> {course.category || 'General Education'}
          </div>
          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.excerpt}>{course.short_description}</p>
          {reviews.length > 0 && (
            <div style={styles.heroRating}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
              <span style={styles.heroRatingValue}>{avgRating.toFixed(1)}</span>
              <span style={styles.heroRatingCount}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
          <div style={styles.metaContainer}>
            <div style={styles.metaItem}><Clock size={18} /> {course.duration || '6 Weeks'}</div>
            <div style={styles.metaItem}><Target size={18} /> {course.difficulty || 'Beginner'}</div>
            <div style={styles.metaItem}><GraduationCap size={18} /> {course.instructor_name || 'Expert Instructor'}</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div style={styles.contentGrid}>
        <motion.div style={styles.mainContent} variants={containerVariants} initial="hidden" animate="visible">
          <motion.h2 style={styles.sectionTitle} variants={itemVariants}>📖 Course Description</motion.h2>
          <motion.p style={styles.description} variants={itemVariants}>{course.description}</motion.p>

          <motion.h2 style={styles.sectionTitle} variants={itemVariants}>📚 Course Syllabus</motion.h2>
          <div style={styles.syllabus}>
            {(course.lessons || []).map((lesson, index) => (
              <motion.div key={lesson.id} style={styles.lessonCard} variants={itemVariants}>
                <div style={styles.lessonNumber}><Hash size={14} /> Lesson {index + 1}</div>
                <h3 style={styles.lessonTitle}>{lesson.title}</h3>
              </motion.div>
            ))}
          </div>

          {/* Reviews */}
          <motion.h2 style={styles.sectionTitle} variants={itemVariants}>
            <MessageSquareText size={22} style={{ verticalAlign: '-4px', marginRight: '0.4rem' }} />
            Student Reviews
          </motion.h2>

          {reviewsLoading ? (
            <motion.div style={styles.center} variants={itemVariants}>
              <div style={styles.spinnerSmall}></div>
            </motion.div>
          ) : reviews.length === 0 ? (
            <motion.p style={styles.noReviews} variants={itemVariants}>
              No reviews yet — be the first to take this course and share your thoughts!
            </motion.p>
          ) : (
            <div style={styles.reviewsList}>
              {reviews.map(review => (
                <motion.div key={review.id} style={styles.reviewCard} variants={itemVariants}>
                  <div style={styles.reviewTop}>
                    <div style={styles.avatar}>{review.student?.[0]?.toUpperCase() || '?'}</div>
                    <div style={{ flex: 1 }}>
                      <p style={styles.reviewerName}>{review.student}</p>
                      <div style={styles.reviewStars}>
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={14}
                            color={i <= review.rating ? '#f59e0b' : '#cbd5e1'}
                            fill={i <= review.rating ? '#fbbf24' : 'none'} />
                        ))}
                      </div>
                    </div>
                    {review.created_at && (
                      <span style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  {review.comment && <p style={styles.reviewComment}>{review.comment}</p>}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

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
                  <Sparkles size={16} /> Start Learning Now
                </button>
              </div>
            ) : (
              <>
                <div style={styles.priceContainer}>
                  <span style={styles.price}>${course.price || '0.00'}</span>
                  <span style={styles.priceNote}>one-time payment</span>
                </div>
                <button style={styles.enrollButton} onClick={handleEnroll}>
                  <Lock size={16} /> Enroll Now
                </button>
                <div style={styles.includesList}>
                  <div style={styles.includesItem}><CheckCircle2 size={16} color="#22c55e" /> Lifetime Access</div>
                  <div style={styles.includesItem}><CheckCircle2 size={16} color="#22c55e" /> Certificate of Completion</div>
                  <div style={styles.includesItem}><CheckCircle2 size={16} color="#22c55e" /> 24/7 Support</div>
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
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#f8fafc'
  },
  hero: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white',
    padding: '4rem 2rem',
    borderBottomLeftRadius: '30px',
    borderBottomRightRadius: '30px',
    boxShadow: '0 12px 30px rgba(59,130,246,0.3)'
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center'
  },
  categoryBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '0.5rem 1.5rem',
    borderRadius: '20px',
    marginBottom: '1rem',
    fontSize: '0.9rem'
  },
  title: {
    fontSize: '2.5rem',
    margin: '1rem 0',
    lineHeight: 1.2,
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.15)',
  },
  excerpt: {
    fontSize: '1.2rem',
    opacity: 0.9,
    marginBottom: '1rem'
  },
  heroRating: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
    marginBottom: '1.5rem',
  },
  heroRatingValue: { fontSize: '1.1rem', fontWeight: '700' },
  heroRatingCount: { opacity: 0.85, fontSize: '0.9rem' },
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
    fontSize: '1.05rem'
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
    borderRadius: '18px',
    padding: '2rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
  },
  sectionTitle: {
    fontSize: '1.6rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '2rem 0 1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #e5e7eb'
  },
  description: {
    color: '#4b5563',
    lineHeight: 1.7,
    fontSize: '1.05rem'
  },
  syllabus: {
    display: 'grid',
    gap: '1.25rem'
  },
  lessonCard: {
    backgroundColor: '#f8fafc',
    padding: '1.5rem',
    borderRadius: '12px',
    borderLeft: '4px solid #3b82f6'
  },
  lessonNumber: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
  },
  lessonTitle: {
    fontSize: '1.15rem',
    margin: 0,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewsList: { display: 'grid', gap: '1.25rem' },
  reviewCard: {
    backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.25rem',
    border: '1px solid #f1f5f9',
  },
  reviewTop: { display: 'flex', alignItems: 'flex-start', gap: '0.85rem' },
  avatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    backgroundColor: '#3b82f6', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '1rem', flexShrink: 0,
  },
  reviewerName: { fontWeight: '600', color: '#1e293b', margin: '0 0 0.25rem', fontSize: '0.95rem' },
  reviewStars: { display: 'flex', gap: '0.1rem' },
  reviewDate: { fontSize: '0.78rem', color: '#94a3b8', flexShrink: 0, whiteSpace: 'nowrap' },
  reviewComment: { color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, margin: '0.85rem 0 0' },
  noReviews: { color: '#6b7280', fontSize: '0.95rem', fontStyle: 'italic' },
  center: { display: 'flex', justifyContent: 'center', padding: '2rem' },
  spinnerSmall: {
    width: '28px', height: '28px', border: '4px solid #e5e7eb',
    borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  enrollmentCard: {
    backgroundColor: 'white',
    borderRadius: '18px',
    padding: '2rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: '2rem'
  },
  priceContainer: {
    textAlign: 'center',
    marginBottom: '1.5rem'
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  priceNote: {
    display: 'block',
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  enrollButton: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    width: '100%',
    padding: '1.1rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  enrolledBadge: {
    textAlign: 'center',
    color: '#166534',
    backgroundColor: '#dcfce7',
    padding: '1.5rem',
    borderRadius: '12px'
  },
  startLearningButton: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    width: '100%',
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  includesList: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #e5e7eb'
  },
  includesItem: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
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
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
    borderTopColor: '#3b82f6',
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