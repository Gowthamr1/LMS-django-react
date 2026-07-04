import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';

function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setPreviewUrl(URL.createObjectURL(file)); }
    else { setImageFile(null); setPreviewUrl(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    if (imageFile) formData.append('image', imageFile);

    try {
      await axiosInstance.post('/api/courses/courses/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('✅ Course created successfully!');
      setTitle(''); setDescription(''); setPrice(''); setImageFile(null); setPreviewUrl('');
    } catch (error) {
      let msg = '❌ Failed to create course.';
      if (error.response?.status === 401) msg = '❌ Unauthorized. Please login again.';
      else if (error.response?.data) msg = `❌ ${Object.values(error.response.data).flat().join(' ')}`;
      setMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.heading}>📘 Create New Course</h1>
        <p style={styles.subheading}>Fill in the details below to publish your course</p>
      </div>

      <div style={styles.card}>
        {message && (
          <div style={{ ...styles.alert, ...(message.startsWith('✅') ? styles.alertSuccess : styles.alertError) }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Course Title</label>
            <input style={styles.input} value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Advanced Web Development" required />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Description</label>
            <textarea style={{ ...styles.input, height: '130px', resize: 'vertical' }}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe your course content and objectives..." required />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Price (USD)</label>
            <div style={{ position: 'relative' }}>
              <span style={styles.prefix}>$</span>
              <input style={{ ...styles.input, paddingLeft: '2rem' }} type="number"
                value={price} onChange={e => setPrice(e.target.value)}
                step="0.01" min="0" placeholder="0.00" required />
            </div>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Course Thumbnail</label>
            <input type="file" accept="image/*" onChange={handleImageChange} style={styles.fileInput} />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={styles.preview} />
            ) : (
              <div style={styles.placeholder}>
                <span style={{ fontSize: '2rem' }}>🖼️</span>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  16:9 aspect ratio recommended
                </span>
              </div>
            )}
          </div>

          <button style={{ ...styles.btn, opacity: isSubmitting ? 0.7 : 1 }} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : '🚀 Create Course'}
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
  card: {
    backgroundColor: 'white', borderRadius: '14px', padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  group: { marginBottom: '1.5rem' },
  label: { display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', fontSize: '0.95rem' },
  input: {
    width: '100%', padding: '0.8rem', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  prefix: {
    position: 'absolute', left: '12px', top: '50%',
    transform: 'translateY(-50%)', color: '#94a3b8',
  },
  fileInput: { display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem' },
  preview: {
    width: '100%', height: '200px', objectFit: 'cover',
    borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  placeholder: {
    height: '200px', backgroundColor: '#f8fafc', borderRadius: '10px',
    border: '2px dashed #cbd5e0', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },
  btn: {
    width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem',
    fontWeight: '700', cursor: 'pointer',
  },
  alert: { padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500' },
  alertSuccess: { backgroundColor: '#dcfce7', color: '#166534' },
  alertError: { backgroundColor: '#fee2e2', color: '#991b1b' },
};

export default CreateCourse;