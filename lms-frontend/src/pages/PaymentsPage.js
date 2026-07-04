import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ switched from raw axios+hardcoded URL to axiosInstance
    axiosInstance.get('/api/courses/payments/')
      .then(res => setPayments(res.data))
      .catch(() => setError('Could not load your payment history.'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return 'N/A'; }
  };

  const totalSpent = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const uniqueCourses = new Set(payments.map(p => p.course)).size;

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>💳 Payment History</h1>
          <p style={styles.subheading}>Your learning investments at a glance</p>
        </div>
        {!loading && payments.length > 0 && (
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>${totalSpent.toFixed(2)}</div>
              <div style={styles.statLabel}>Total Spent</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{uniqueCourses}</div>
              <div style={styles.statLabel}>Courses Owned</div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={styles.center}><div style={styles.spinner}></div></div>
      ) : error ? (
        <div style={styles.errorBox}>⚠️ {error}</div>
      ) : payments.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No payments yet</h3>
          <p style={styles.emptyText}>Enroll in a course to get started!</p>
        </div>
      ) : (
        <div style={styles.tableCard}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Course</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                  <th style={styles.th}>Date</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.courseCell}>
                        <div style={styles.courseAvatar}>📚</div>
                        <span style={styles.courseName}>
                          {payment.course_title || `Course #${payment.course}`}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </td>
                    <td style={{ ...styles.td, color: '#64748b', fontSize: '0.875rem' }}>
                      📅 {formatDate(payment.paid_on)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={payment.paid ? styles.badgeSuccess : styles.badgePending}>
                        {payment.paid ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '1000px', margin: '0 auto', padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8fafc', minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    borderRadius: '16px', padding: '2rem', marginBottom: '2rem',
    color: 'white', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
  },
  heading: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  subheading: { opacity: 0.85, margin: '0.25rem 0 0', fontSize: '1rem' },
  statsRow: {
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '1rem 1.75rem', borderRadius: '12px',
  },
  statBox: { textAlign: 'center' },
  statValue: { fontSize: '1.75rem', fontWeight: '800', color: 'white', lineHeight: 1 },
  statLabel: { fontSize: '0.75rem', opacity: 0.85, marginTop: '0.2rem', textTransform: 'uppercase' },
  statDivider: { width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.3)' },
  tableCard: {
    backgroundColor: 'white', borderRadius: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { backgroundColor: '#f8fafc' },
  th: {
    padding: '1rem 1.25rem', textAlign: 'left',
    color: '#64748b', fontWeight: '700', fontSize: '0.78rem',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '2px solid #e2e8f0',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '1rem 1.25rem', verticalAlign: 'middle' },
  courseCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  courseAvatar: {
    width: '36px', height: '36px', backgroundColor: '#e0f2fe',
    borderRadius: '8px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
  },
  courseName: { fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' },
  badgeSuccess: {
    backgroundColor: '#dcfce7', color: '#166534',
    padding: '0.3rem 0.85rem', borderRadius: '20px',
    fontSize: '0.8rem', fontWeight: '700',
  },
  badgePending: {
    backgroundColor: '#fef9c3', color: '#854d0e',
    padding: '0.3rem 0.85rem', borderRadius: '20px',
    fontSize: '0.8rem', fontWeight: '700',
  },
  emptyBox: {
    backgroundColor: 'white', borderRadius: '14px', padding: '4rem 2rem',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.5rem', color: '#1e293b', margin: '0 0 0.5rem' },
  emptyText: { color: '#64748b' },
  errorBox: {
    backgroundColor: '#fee2e2', color: '#991b1b',
    padding: '1rem', borderRadius: '8px', fontWeight: '500',
  },
  center: { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner: {
    width: '48px', height: '48px', border: '5px solid #e2e8f0',
    borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite',
  },
};

export default PaymentsPage;