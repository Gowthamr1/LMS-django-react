import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

function AdminManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/courses/reviews/')
      .then(res => {
        setReviews(res.data);
        setError('');
      })
      .catch(err => {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load reviews. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (reviewId) => {
    if(window.confirm('Are you sure you want to delete this review?')) {
      axiosInstance.delete(`/api/courses/reviews/${reviewId}/`)
        .then(() => setReviews(prev => prev.filter(r => r.id !== reviewId)))
        .catch(err => {
          console.error('Failed to delete review:', err);
          alert('Failed to delete review. Please try again.');
        });
    }
  };

  const startEditing = (reviewId, currentComment) => {
    setEditingReviewId(reviewId);
    setEditedComment(currentComment);
  };

  const handleEditSubmit = (reviewId) => {
    axiosInstance.patch(`/api/courses/reviews/${reviewId}/`, { comment: editedComment })
      .then(res => {
        setReviews(prev =>
          prev.map(r => r.id === reviewId ? { ...r, comment: editedComment } : r)
        );
        setEditingReviewId(null);
        setEditedComment('');
      })
      .catch(err => {
        console.error('Failed to update review:', err);
        alert('Failed to update review. Please try again.');
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Manage User Reviews</h2>
        <button style={styles.refreshButton} onClick={() => window.location.reload()}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading reviews...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : reviews.length === 0 ? (
        <div style={styles.empty}>No reviews found</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Course</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Rating</th>
                <th style={styles.th}>Comment</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id} style={styles.tr}>
                  <td style={styles.td}>{review.course_title}</td>
                  <td style={styles.td}>{review.student}</td>
                  <td style={styles.td}>
                    <div style={styles.rating}>
                      {Array(5).fill().map((_, i) => (
                        <span key={i} style={i < review.rating ? styles.starFilled : styles.star}>
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {editingReviewId === review.id ? (
                      <div style={styles.editGroup}>
                        <textarea
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          style={styles.textarea}
                        />
                        <div style={styles.buttonGroup}>
                          <button 
                            style={styles.saveButton}
                            onClick={() => handleEditSubmit(review.id)}
                          >
                            Save
                          </button>
                          <button
                            style={styles.cancelButton}
                            onClick={() => setEditingReviewId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.comment}>
                        {review.comment || <span style={styles.noComment}>—</span>}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      <button
                        style={styles.editButton}
                        onClick={() => startEditing(review.id, review.comment)}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDelete(review.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  title: {
    color: '#2c3e50',
    margin: 0
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#e9ecef'
    }
  },
  tableContainer: {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white'
  },
  th: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
    textAlign: 'left'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #e9ecef',
    verticalAlign: 'top'
  },
  tr: {
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f8f9fa'
    }
  },
  rating: {
    display: 'flex',
    gap: '0.25rem'
  },
  star: {
    color: '#e9ecef'
  },
  starFilled: {
    color: '#ffd700'
  },
  editGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    minHeight: '80px',
    resize: 'vertical'
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end'
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  comment: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5'
  },
  noComment: {
    color: '#6c757d'
  },
  actionGroup: {
    display: 'flex',
    gap: '0.5rem'
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6c757d'
  },
  error: {
    padding: '1rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    border: '1px solid #f5c6cb',
    marginBottom: '1rem'
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6c757d'
  }
};

export default AdminManageReviews;