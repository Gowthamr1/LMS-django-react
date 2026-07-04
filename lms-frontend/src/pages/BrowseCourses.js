import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';

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
      <div style={styles.header}>
        <h1 style={styles.heading}>🚀 Discover Courses</h1>
        <p style={styles.subheading}>Expand your skills with expert-led courses</p>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
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
      </div>

      {/* Loading */}
      {loading ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>{search ? '🔎' : '📭'}</div>
          <h3 style={styles.emptyTitle}>{search ? 'No courses match your search' : 'No courses available yet'}</h3>
          <p style={styles.emptyText}>{search ? 'Try different keywords or clear filters.' : 'Check back soon!'}</p>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all'); }} style={styles.clearBtn}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(course => {
            const isFree = parseFloat(course.price || 0) === 0;
            return (
              <div key={course.id} style={styles.card}>
                {/* Image */}
                <div style={styles.imageWrap}>
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} style={styles.image}
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div style={styles.imagePlaceholder}>
                      <span style={{ fontSize: '3.5rem' }}>📚</span>
                    </div>
                  )}
                  {/* Overlay badges */}
                  <div style={styles.topLeft}>
                    {isFree
                      ? <span style={styles.freeBadge}>FREE</span>
                      : <span style={styles.priceBadge}>${parseFloat(course.price).toFixed(2)}</span>
                    }
                  </div>
                </div>

                {/* Body */}
                <div style={styles.cardBody}>
                  <h3 style={styles.courseTitle}>{course.title}</h3>
                  {course.instructor_name && (
                    <p style={styles.instructor}>👨‍🏫 {course.instructor_name}</p>
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
                      📖 {course.lessons?.length ?? 0} lesson{course.lessons?.length !== 1 ? 's' : ''}
                    </span>
                    <span style={styles.chip}>📈 Beginner</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={styles.cardFooter}>
                  <Link to={`/courses/${course.id}`} style={styles.exploreBtn}>
                    Explore Course →
                  </Link>
                </div>
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
  heading: { fontSize: '2.2rem', fontWeight: '800', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.3rem 0 1.25rem', fontSize: '1rem' },
  searchWrap: { position: 'relative', marginBottom: '1rem' },
  searchIcon: {
    position: 'absolute', left: '1rem', top: '50%',
    transform: 'translateY(-50%)', fontSize: '1rem',
  },
  searchInput: {
    width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
    border: 'none', borderRadius: '10px', fontSize: '1rem',
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
    marginLeft: 'auto', opacity: 0.85, fontSize: '0.875rem', fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white', borderRadius: '14px',
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    display: 'flex', flexDirection: 'column',
  },
  imageWrap: { position: 'relative', height: '185px' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imagePlaceholder: {
    width: '100%', height: '100%', backgroundColor: '#e0f2fe',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  topLeft: { position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.5rem' },
  freeBadge: {
    backgroundColor: '#22c55e', color: 'white',
    padding: '0.25rem 0.75rem', borderRadius: '20px',
    fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.05em',
  },
  priceBadge: {
    backgroundColor: 'rgba(0,0,0,0.65)', color: 'white',
    padding: '0.25rem 0.75rem', borderRadius: '20px',
    fontSize: '0.85rem', fontWeight: '700',
  },
  cardBody: { padding: '1.25rem', flex: 1 },
  courseTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.3rem' },
  instructor: { fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.6rem' },
  desc: { fontSize: '0.875rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 0.9rem' },
  chips: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#f1f5f9', color: '#475569',
    padding: '0.2rem 0.65rem', borderRadius: '6px',
    fontSize: '0.78rem', fontWeight: '600',
  },
  cardFooter: { padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9' },
  exploreBtn: {
    display: 'block', textAlign: 'center', padding: '0.7rem',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: 'white', borderRadius: '8px', textDecoration: 'none',
    fontWeight: '700', fontSize: '0.95rem',
  },
  emptyBox: {
    backgroundColor: 'white', borderRadius: '14px', padding: '4rem 2rem',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.5rem', color: '#1e293b', margin: '0 0 0.5rem' },
  emptyText: { color: '#64748b', marginBottom: '1.5rem' },
  clearBtn: {
    padding: '0.65rem 1.5rem', backgroundColor: '#3b82f6',
    color: 'white', border: 'none', borderRadius: '8px',
    fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem',
  },
  center: { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner: {
    width: '48px', height: '48px', border: '5px solid #e2e8f0',
    borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
};

export default BrowseCourses;