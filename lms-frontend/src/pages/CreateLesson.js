import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

function CreateLesson() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ courseId: '', title: '', content: '', order: 1, image: null, video: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState({ courses: true, submitting: false });

  useEffect(() => {
    axiosInstance.get('/api/courses/courses/')
      .then(res => setCourses(res.data))
      .catch(() => setMessage('❌ Failed to load courses.'))
      .finally(() => setLoading(prev => ({ ...prev, courses: false })));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      if (name === 'image') setPreviewImage(URL.createObjectURL(file));
      if (name === 'video') setVideoName(file.name);
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submitting: true }));
    setMessage('');
    const payload = new FormData();
    payload.append('course', formData.courseId);
    payload.append('title', formData.title);
    payload.append('content', formData.content);
    payload.append('order', formData.order);
    if (formData.image) payload.append('image', formData.image);
    if (formData.video) payload.append('video', formData.video);

    try {
      await axiosInstance.post('/api/courses/lessons/', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('✅ Lesson created successfully!');
      setTimeout(() => navigate(`/instructor/manage-lessons/${formData.courseId}`), 1500);
      setFormData({ courseId: '', title: '', content: '', order: 1, image: null, video: null });
      setPreviewImage(null); setVideoName('');
    } catch (error) {
      const errMsg = error.response?.data ? Object.values(error.response.data).flat().join(' ') : 'Failed to create lesson.';
      setMessage(`❌ ${errMsg}`);
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.heading}>🎬 Create New Lesson</h1>
        <p style={styles.subheading}>Add a lesson with content, video, and media</p>
      </div>

      <div style={styles.card}>
        {message && (
          <div style={{ ...styles.alert, ...(message.startsWith('✅') ? styles.alertSuccess : styles.alertError) }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Select Course</label>
            <select name="courseId" style={styles.input} value={formData.courseId}
              onChange={handleChange} required disabled={loading.courses}>
              <option value="">{loading.courses ? 'Loading courses...' : '— Select a course —'}</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Lesson Title</label>
            <input name="title" style={styles.input} value={formData.title}
              onChange={handleChange} placeholder="e.g. Introduction to React Hooks" required />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Lesson Content</label>
            <textarea name="content" style={{ ...styles.input, height: '150px', resize: 'vertical' }}
              value={formData.content} onChange={handleChange}
              placeholder="Enter detailed lesson content here..." required />
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1, ...styles.group }}>
              <label style={styles.label}>Lesson Order</label>
              <input type="number" name="order" style={styles.input} value={formData.order} min="1"
                onChange={e => setFormData(prev => ({ ...prev, order: Math.max(1, parseInt(e.target.value) || 1) }))}
                required />
            </div>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Lesson Video</label>
            <input type="file" name="video" accept="video/*" onChange={handleChange} style={styles.fileInput} />
            {videoName && (
              <div style={styles.fileTag}>🎬 {videoName}</div>
            )}
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Lesson Image (optional)</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} style={styles.fileInput} />
            {previewImage ? (
              <img src={previewImage} alt="Preview" style={styles.preview} />
            ) : (
              <div style={styles.placeholder}>
                <span style={{ fontSize: '1.8rem' }}>🖼️</span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.4rem' }}>No image selected</span>
              </div>
            )}
          </div>

          <button style={{ ...styles.btn, opacity: (loading.submitting || loading.courses) ? 0.7 : 1 }}
            type="submit" disabled={loading.submitting || loading.courses}>
            {loading.submitting ? 'Creating Lesson...' : '🚀 Create Lesson'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '800px', margin: '0 auto', padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc', minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem', color: 'white',
  },
  heading: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.4rem 0 0', fontSize: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '14px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  group: { marginBottom: '1.5rem' },
  row: { display: 'flex', gap: '1.5rem' },
  label: { display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', fontSize: '0.95rem' },
  input: {
    width: '100%', padding: '0.8rem', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  fileInput: { display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem' },
  fileTag: {
    display: 'inline-block', backgroundColor: '#eff6ff', color: '#3b82f6',
    padding: '0.35rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600',
  },
  preview: { width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px' },
  placeholder: {
    height: '120px', backgroundColor: '#f8fafc', borderRadius: '10px',
    border: '2px dashed #cbd5e0', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  btn: {
    width: '100%', padding: '0.9rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
  },
  alert: { padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500' },
  alertSuccess: { backgroundColor: '#dcfce7', color: '#166534' },
  alertError: { backgroundColor: '#fee2e2', color: '#991b1b' },
};

export default CreateLesson;