import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

export default function PaymentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('credit_card');

  useEffect(() => {
    // axiosInstance now automatically attaches the token via interceptor
    const fetchCourse = async () => {
      try {
        const res = await axiosInstance.get(`/api/courses/courses/${courseId}/`);
        setCourse(res.data);
      } catch (err) {
        setMessage('❌ Failed to load course info.');
        console.error(err);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleMockPayment = async () => {
    setMessage('');
    setLoading(true);

    // Short mock delay (1.5s) so it feels like processing without freezing the UI
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await axiosInstance.post('/api/courses/payments/', { course: courseId });
      setMessage('🎉 Payment successful! Redirecting...');
      setTimeout(() => navigate('/student/my-courses'), 2000);
    } catch (err) {
      // DRF validation errors can come back as arrays or under non_field_errors
      const data = err.response?.data;
      const msg =
        data?.detail ||
        (Array.isArray(data) ? data[0] : null) ||
        data?.non_field_errors?.[0] ||
        '❌ Payment failed. Please try again.';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={styles.header}>
        {course?.thumbnail && (
          <img src={course.thumbnail} alt="Course thumbnail" style={styles.thumbnail} />
        )}
        <h1 style={styles.title}>{course?.title || 'Course Enrollment'}</h1>
        {course && (
          <div style={styles.priceTag}>
            <span style={styles.price}>${course.price}</span>
            <span style={styles.priceLabel}>one-time payment</span>
          </div>
        )}
      </div>

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>💸 Choose Payment Method</h2>

        <div style={styles.methodGrid}>
          {['credit_card', 'paypal', 'upi'].map((m) => (
            <button
              key={m}
              style={{
                ...styles.methodCard,
                ...(method === m ? styles.selectedMethod : {})
              }}
              onClick={() => setMethod(m)}
            >
              <span style={styles.methodEmoji}>
                {m === 'credit_card' ? '💳' : m === 'paypal' ? '🅿️' : '📱'}
              </span>
              <span style={styles.methodName}>
                {m === 'credit_card' ? 'Credit Card' : m === 'paypal' ? 'PayPal' : 'UPI'}
              </span>
            </button>
          ))}
        </div>

        <div style={styles.paymentDetails}>
          <div style={styles.detailItem}>
            <span>Course Access:</span>
            <span style={styles.detailValue}>Lifetime 🔒</span>
          </div>
          <div style={styles.detailItem}>
            <span>Support:</span>
            <span style={styles.detailValue}>24/7 🕒</span>
          </div>
        </div>

        <button
          onClick={handleMockPayment}
          disabled={loading}
          style={styles.payButton}
        >
          {loading ? (
            <>
              <div style={styles.spinner}></div>
              Processing...
            </>
          ) : (
            `Pay with ${method.replace('_', ' ')} →`
          )}
        </button>

        {message && (
          <div style={{
            ...styles.message,
            ...(message.startsWith('🎉') ? styles.successMessage : styles.errorMessage)
          }}>
            {message}
          </div>
        )}

        <div style={styles.securityNote}>
          🔒 Secure payment processing
          <div style={styles.securityBadges}>
            <span style={styles.badge}>PCI DSS</span>
            <span style={styles.badge}>SSL</span>
            <span style={styles.badge}>3D Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    color: 'white',
    padding: '2rem',
    textAlign: 'center'
  },
  thumbnail: {
    width: '100px',
    height: '100px',
    borderRadius: '15px',
    marginBottom: '1rem',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  },
  title: {
    fontSize: '1.8rem',
    margin: '0.5rem 0',
    fontWeight: '600'
  },
  priceTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '0.8rem 1.5rem',
    borderRadius: '30px',
    display: 'inline-block',
    marginTop: '1rem'
  },
  price: {
    fontSize: '2rem',
    fontWeight: '700',
    display: 'block'
  },
  priceLabel: {
    fontSize: '0.9rem',
    opacity: 0.9
  },
  content: {
    padding: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#1f2937',
    marginBottom: '1.5rem'
  },
  methodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem'
  },
  methodCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1rem',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  selectedMethod: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 10px rgba(79,70,229,0.15)'
  },
  methodEmoji: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '0.5rem'
  },
  methodName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  paymentDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.8rem',
    color: '#4b5563'
  },
  detailValue: {
    fontWeight: '600',
    color: '#1f2937'
  },
  payButton: {
    width: '100%',
    padding: '1.2rem',
    background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  message: {
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1.5rem',
    textAlign: 'center',
    fontWeight: '500'
  },
  successMessage: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  securityNote: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.9rem',
    marginTop: '2rem'
  },
  securityBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  badge: {
    backgroundColor: '#e5e7eb',
    color: '#4b5563',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.8rem'
  }
};