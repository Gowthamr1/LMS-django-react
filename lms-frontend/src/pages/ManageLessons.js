import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

function ManageLessons() {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingLesson, setEditingLesson] = useState(null);
  const [editData, setEditData] = useState({ title: '', content: '', order: 1, image_url: '', video_url: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          axiosInstance.get(`/api/courses/courses/${courseId}/`),
          axiosInstance.get(`/api/courses/lessons/?course=${courseId}`),
        ]);
        setCourseTitle(courseRes.data.title);
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error('Failed to load lessons:', err);
        setError(err.response?.data?.detail || 'Unable to load this course or its lessons.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const startEditing = (lesson) => {
    setEditingLesson(lesson);
    setEditData({
      title: lesson.title,
      content: lesson.content || '',
      order: lesson.order,
      image_url: lesson.image_url || '',
      video_url: lesson.video_url || '',
    });
  };

  const saveLesson = async (event) => {
    event.preventDefault();
    if (!editingLesson) return;
    setSaving(true);
    setError('');
    try {
      const response = await axiosInstance.patch(`/api/courses/lessons/${editingLesson.id}/`, editData);
      setLessons(current => current.map(lesson => lesson.id === response.data.id ? response.data : lesson));
      setEditingLesson(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update this lesson.');
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lesson) => {
    if (!window.confirm(`Delete "${lesson.title}"? This cannot be undone.`)) return;
    setDeletingId(lesson.id);
    setError('');
    try {
      await axiosInstance.delete(`/api/courses/lessons/${lesson.id}/`);
      setLessons(current => current.filter(item => item.id !== lesson.id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete this lesson.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Manage Lessons</h1>
          <p style={styles.subheading}>{courseTitle || 'Loading course...'}</p>
        </div>
        <Link to={`/instructor/create-lesson?courseId=${courseId}`} style={styles.addButton}>Add Lesson</Link>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : lessons.length === 0 ? (
        <div style={styles.emptyBox}>
          <h3 style={styles.emptyTitle}>No lessons yet</h3>
          <p style={styles.emptyText}>Start adding lessons to this course.</p>
          <Link to={`/instructor/create-lesson?courseId=${courseId}`} style={styles.addButton}>Add First Lesson</Link>
        </div>
      ) : (
        <div style={styles.list}>
          {lessons.slice().sort((a, b) => a.order - b.order).map((lesson, index) => (
            <div key={lesson.id} style={styles.card}>
              <div style={styles.orderBadge}>{lesson.order}</div>
              <div style={styles.cardBody}>
                <h3 style={styles.lessonTitle}>{lesson.title}</h3>
                {lesson.content && <p style={styles.lessonPreview}>{lesson.content.length > 120 ? `${lesson.content.slice(0, 120)}...` : lesson.content}</p>}
                <div style={styles.badges}>
                  {(lesson.video || lesson.video_url) && <span style={styles.badge}>Video</span>}
                  {(lesson.image || lesson.image_url) && <span style={styles.badge}>Image</span>}
                </div>
              </div>
              <div style={styles.actions}>
                <button type="button" onClick={() => startEditing(lesson)} style={styles.editButton}>Edit</button>
                <button type="button" onClick={() => deleteLesson(lesson)} disabled={deletingId === lesson.id} style={styles.deleteButton}>
                  {deletingId === lesson.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              <div style={styles.lessonIndex}>#{index + 1}</div>
            </div>
          ))}
        </div>
      )}

      {editingLesson && (
        <div style={styles.modalBackdrop}>
          <form onSubmit={saveLesson} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Lesson</h2>
              <button type="button" onClick={() => setEditingLesson(null)} style={styles.closeButton} aria-label="Close">x</button>
            </div>
            <label style={styles.label}>Lesson Title</label>
            <input required value={editData.title} onChange={event => setEditData(current => ({ ...current, title: event.target.value }))} style={styles.input} />
            <label style={styles.label}>Lesson Content</label>
            <textarea required value={editData.content} onChange={event => setEditData(current => ({ ...current, content: event.target.value }))} style={{ ...styles.input, height: '130px', resize: 'vertical' }} />
            <label style={styles.label}>Lesson Order</label>
            <input required type="number" min="1" value={editData.order} onChange={event => setEditData(current => ({ ...current, order: Number(event.target.value) || 1 }))} style={styles.input} />
            <label style={styles.label}>Video URL</label>
            <input type="url" value={editData.video_url} onChange={event => setEditData(current => ({ ...current, video_url: event.target.value }))} placeholder="https://..." style={styles.input} />
            <label style={styles.label}>Image URL</label>
            <input type="url" value={editData.image_url} onChange={event => setEditData(current => ({ ...current, image_url: event.target.value }))} placeholder="https://..." style={styles.input} />
            <div style={styles.modalActions}>
              <button type="button" onClick={() => setEditingLesson(null)} style={styles.cancelButton}>Cancel</button>
              <button type="submit" disabled={saving} style={styles.saveButton}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  heading: { fontSize: '1.9rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.25rem 0 0', fontSize: '1rem' },
  addButton: { backgroundColor: 'white', color: '#3b82f6', padding: '0.7rem 1.4rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem', whiteSpace: 'nowrap' },
  errorBox: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'flex-start', gap: '1.25rem' },
  orderBadge: { backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '10px', padding: '0.4rem 0.75rem', fontWeight: '700', fontSize: '1rem', flexShrink: 0, marginTop: '2px' },
  cardBody: { flex: 1, minWidth: 0 },
  lessonTitle: { fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.4rem' },
  lessonPreview: { fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.6rem' },
  badges: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  badge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600' },
  actions: { display: 'flex', gap: '0.5rem', flexShrink: 0 },
  editButton: { border: 'none', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '7px', padding: '0.45rem 0.75rem', cursor: 'pointer', fontWeight: '700' },
  deleteButton: { border: 'none', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '7px', padding: '0.45rem 0.75rem', cursor: 'pointer', fontWeight: '700' },
  lessonIndex: { color: '#cbd5e1', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0 },
  emptyBox: { backgroundColor: 'white', borderRadius: '14px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  emptyTitle: { fontSize: '1.5rem', color: '#1e293b', margin: '0 0 0.5rem' },
  emptyText: { color: '#64748b', marginBottom: '1.5rem' },
  center: { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner: { width: '48px', height: '48px', border: '5px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  modalBackdrop: { position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  modalTitle: { color: '#1e293b', margin: 0, fontSize: '1.35rem' },
  closeButton: { border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 },
  label: { display: 'block', color: '#334155', fontWeight: '700', fontSize: '0.9rem', margin: '0.9rem 0 0.4rem' },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', font: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' },
  cancelButton: { border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#334155', borderRadius: '8px', padding: '0.65rem 1rem', cursor: 'pointer', fontWeight: '700' },
  saveButton: { border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', padding: '0.65rem 1rem', cursor: 'pointer', fontWeight: '700' },
};

export default ManageLessons;
