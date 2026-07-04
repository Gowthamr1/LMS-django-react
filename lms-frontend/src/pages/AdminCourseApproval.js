import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

function AdminCourseApproval() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/courses/courses/')
      .then(res => {
        setCourses(res.data);
        setError('');
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to permanently delete this course?')) {
      axiosInstance.delete(`/api/courses/courses/${id}/`)
        .then(() => setCourses(prev => prev.filter(course => course.id !== id)))
        .catch(err => {
          console.error('Failed to delete course:', err);
          alert('Failed to delete course. Please try again.');
        });
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Course Management</h2>
      
      {loading ? (
        <div style={styles.loading}>Loading courses...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : courses.length === 0 ? (
        <div style={styles.empty}>No courses found</div>
      ) : (
        <div style={styles.grid}>
          {courses.map(course => (
            <div key={course.id} style={styles.card}>
              
              {/* Course Image */}
              {course.image_url && (
                <img 
                  src={course.image_url} 
                  alt={course.title} 
                  style={styles.courseImage} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              <div style={styles.cardContent}>
                <h3 style={styles.title}>{course.title}</h3>
                <div style={styles.meta}>
                  <span style={styles.instructor}>Instructor #{course.instructor}</span>
                  {course.category && (
                    <span style={styles.category}>{course.category}</span>
                  )}
                </div>
                {course.description && (
                  <p style={styles.description}>{course.description}</p>
                )}
              </div>

              <div style={styles.actions}>
                <button 
                  style={styles.deleteButton}
                  onClick={() => handleDelete(course.id)}
                >
                  <span role="img" aria-label="Delete">🗑</span> Delete Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    color: '#2c3e50',
    marginBottom: '2rem',
    fontSize: '1.5rem',
    fontWeight: '600'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    alignItems: 'stretch'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  courseImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderBottom: '1px solid #e9ecef'
  },
  cardContent: {
    padding: '1.5rem',
    flex: 1
  },
  title: {
    fontSize: '1.1rem',
    margin: '0 0 0.5rem 0',
    color: '#2c3e50',
    fontWeight: '500'
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    gap: '0.5rem'
  },
  instructor: {
    color: '#6c757d',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  category: {
    backgroundColor: '#e9ecef',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    flexShrink: 0
  },
  description: {
    fontSize: '0.9rem',
    color: '#6c757d',
    lineHeight: '1.5',
    margin: '0'
  },
  actions: {
    borderTop: '1px solid #e9ecef',
    padding: '1rem 1.5rem',
    textAlign: 'center',
    marginTop: 'auto',
    backgroundColor: '#f8f9fa'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    width: '100%',
    justifyContent: 'center'
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '1.1rem'
  },
  error: {
    padding: '2rem',
    textAlign: 'center',
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    borderRadius: '8px',
    margin: '1rem 0',
    fontSize: '1rem'
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '1.1rem'
  }
};

export default AdminCourseApproval;
