import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, GraduationCap, TrendingUp, Gift,  Inbox, SearchX } from 'lucide-react';

// ── Animation variants (matches StudentDashboard / Reviews) ────────
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
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const ACCENTS = [
  { color: '#06b6d4', bg: '#ecfeff' },
];

function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | free | paid

  useEffect(() => {
    axiosInstance.get('/api/courses/courses/')
      .then(res => setCourses(res.data))
      .catch(err => console.error('Failed to fetch courses:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'free' && parseFloat(c.price || 0) === 0) ||
      (filter === 'paid' && parseFloat(c.price || 0) > 0);
    return matchSearch && matchFilter;
  });

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <motion.div style={styles.header} variants={headerVariants} initial="hidden" animate="visible">
        <h1 style={styles.heading}>🚀 Discover Courses</h1>
        <p style={styles.subheading}>Expand your skills with expert-led courses</p>

        {/* Search */}
        <div style={styles.searchWrap}>
          <Search size={18} style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Search by title or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div style={styles.filterRow}>
          {['all', 'free', 'paid'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...styles.pill, ...(filter === f ? styles.pillActive : {}) }}>
              {f === 'all' ? '📚 All' : f === 'free' ? '🎁 Free' : '💳 Paid'}
            </button>
          ))}
          <span style={styles.resultCount}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIconWrap}>
            {search ? <SearchX size={40} color="#3b82f6" /> : <Inbox size={40} color="#3b82f6" />}
          </div>
          <h3 style={styles.emptyTitle}>{search ? 'No courses match your search' : 'No courses available yet'}</h3>
          <p style={styles.emptyText}>{search ? 'Try different keywords or clear filters.' : 'Check back soon!'}</p>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all'); }} style={styles.clearBtn}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <motion.div style={styles.grid} variants={containerVariants} initial="hidden" animate="visible">
          {filtered.map((course, i) => {
            const isFree = parseFloat(course.price || 0) === 0;
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <motion.div
                key={course.id}
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
                {/* Image */}
                <div style={styles.imageWrap}>
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} style={styles.image}
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div style={{ ...styles.imagePlaceholder, backgroundColor: accent.bg }}>
                      <BookOpen size={48} color={accent.color} strokeWidth={1.5} />
                    </div>
                  )}
                  {/* Overlay badges */}
                  <div style={styles.topLeft}>
                    {isFree
                      ? <span style={styles.freeBadge}><Gift size={12} /> FREE</span>
                      : <span style={styles.priceBadge}>${parseFloat(course.price).toFixed(2)}</span>
                    }
                  </div>
                </div>

                {/* Body */}
                <div style={styles.cardBody}>
                  <h3 style={{ ...styles.courseTitle, color: accent.color }}>{course.title}</h3>
                  {course.instructor_name && (
                    <p style={styles.instructor}>
                      <GraduationCap size={14} style={{ marginRight: '0.3rem', verticalAlign: '-2px' }} />
                      {course.instructor_name}
                    </p>
                  )}
                  <p style={styles.desc}>
                    {course.description
                      ? course.description.length > 110
                        ? course.description.slice(0, 110) + '…'
                        : course.description
                      : 'No description provided.'}
                  </p>

                  {/* Meta chips */}
                  <div style={styles.chips}>
                    <span style={styles.chip}>
                      <BookOpen size={12} /> {course.lessons?.length ?? 0} lesson{course.lessons?.length !== 1 ? 's' : ''}
                    </span>
                    <span style={styles.chip}><TrendingUp size={12} /> Beginner</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={styles.cardFooter}>
                  <Link to={`/courses/${course.id}`} style={{ ...styles.exploreBtn, background: `linear-gradient(135deg, ${accent.color} 0%, #6366f1 100%)` }}>
                    Explore Course →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1200px', margin: '0 auto', padding: '2rem',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    perspective: '1200px',
  },
  header: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '20px', padding: '2.5rem 2rem', marginBottom: '2rem', color: 'white',
    boxShadow: '0 12px 30px rgba(59,130,246,0.3)',
  },
  heading: { fontSize: '2.2rem', fontWeight: '700', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.15)' },
  subheading: { opacity: 0.9, margin: '0.4rem 0 1.5rem', fontSize: '1rem' },
  searchWrap: { position: 'relative', marginBottom: '1rem' },
  searchIcon: {
    position: 'absolute', left: '1rem', top: '50%',
    transform: 'translateY(-50%)', color: '#94a3b8',
  },
  searchInput: {
    width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
    border: 'none', borderRadius: '12px', fontSize: '1rem',
    boxSizing: 'border-box', fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  filterRow: {
    display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap',
  },
  pill: {
    padding: '0.4rem 1rem', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.4)',
    backgroundColor: 'transparent', color: 'white', fontWeight: '600',
    cursor: 'pointer', fontSize: '0.875rem',
  },
  pillActive: {
    backgroundColor: 'white', color: '#3b82f6', border: '2px solid white',
  },
  resultCount: {
    marginLeft: 'auto', opacity: 0.9, fontSize: '0.875rem', fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white', borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 12px rgba(0,0,0,0.06), 0 16px 28px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column',
    transformStyle: 'preserve-3d',
  },
  imageWrap: { position: 'relative', height: '185px' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  topLeft: { position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.5rem' },
  freeBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    backgroundColor: '#22c55e', color: 'white',
    padding: '0.25rem 0.75rem', borderRadius: '20px',
    fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.03em',
  },
  priceBadge: {
    backgroundColor: 'rgba(0,0,0,0.65)', color: 'white',
    padding: '0.25rem 0.75rem', borderRadius: '20px',
    fontSize: '0.85rem', fontWeight: '700',
  },
  cardBody: { padding: '1.25rem', flex: 1 },
  courseTitle: { fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.35rem' },
  instructor: { fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.6rem', display: 'flex', alignItems: 'center' },
  desc: { fontSize: '0.875rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 0.9rem' },
  chips: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    backgroundColor: '#f1f5f9', color: '#475569',
    padding: '0.25rem 0.7rem', borderRadius: '8px',
    fontSize: '0.78rem', fontWeight: '600',
  },
  cardFooter: { padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9' },
  exploreBtn: {
    display: 'block', textAlign: 'center', padding: '0.75rem',
    color: 'white', borderRadius: '10px', textDecoration: 'none',
    fontWeight: '600', fontSize: '0.95rem',
  },
  emptyBox: {
    backgroundColor: 'white', borderRadius: '18px', padding: '4rem 2rem',
    textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  emptyIconWrap: {
    width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#eff6ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.25rem',
  },
  emptyTitle: { fontSize: '1.5rem', color: '#1e293b', margin: '0 0 0.5rem', fontWeight: '600' },
  emptyText: { color: '#64748b', marginBottom: '1.5rem' },
  clearBtn: {
    padding: '0.65rem 1.5rem', backgroundColor: '#3b82f6',
    color: 'white', border: 'none', borderRadius: '10px',
    fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem',
  },
  center: { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner: {
    width: '48px', height: '48px', border: '5px solid #e2e8f0',
    borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
};

export default BrowseCourses;