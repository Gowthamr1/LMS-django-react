import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';

function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/courses/certificates/')
      .then((response) => setCertificates(response.data))
      .catch(() => setMessage('We could not load your certificates. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <h1 style={styles.title}>My Certificates</h1>
        <p style={styles.subtitle}>Your verified learning achievements, ready to download and share.</p>
      </section>

      {message && <p style={styles.message}>{message}</p>}
      {loading ? <LmsLoader title="Loading certificates" subtitle="Checking your achievements" size="lg" /> : certificates.length === 0 ? (
        <section style={styles.empty}>
          <h2>No certificates yet</h2>
          <p>Complete every lesson and pass each required quiz to earn one.</p>
        </section>
      ) : (
        <section style={styles.grid}>
          {certificates.map((certificate) => (
            <article key={certificate.certificate_id} className="liquid-glass-card" style={styles.card}>
              <p style={styles.badge}>Verified completion</p>
              <h2 style={styles.course}>{certificate.course_title}</h2>
              <p style={styles.detail}><strong>Student:</strong> {certificate.student_name}</p>
              <p style={styles.detail}><strong>Instructor:</strong> {certificate.instructor_name}</p>
              <p style={styles.detail}><strong>Issued:</strong> {new Date(certificate.issued_at).toLocaleDateString()}</p>
              <p style={styles.id}>ID: {certificate.certificate_id}</p>
              <div style={styles.actions}>
                <Link to={`/student/certificates/${certificate.certificate_id}`} style={styles.download}>View Certificate</Link>
                <Link to={`/verify-certificate/${certificate.certificate_id}`} style={styles.verify}>Verification page</Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px', minHeight: '100vh' },
  header: { background: 'linear-gradient(135deg, #0ea5e9, #4f46e5)', color: '#fff', padding: '36px', borderRadius: 18, boxShadow: '0 12px 28px rgba(59, 130, 246, .25)' },
  title: { margin: 0, fontSize: '2.2rem' }, subtitle: { margin: '10px 0 0', opacity: .92 },
  message: { margin: '20px 0', color: '#1d4ed8' }, state: { textAlign: 'center', padding: 48 },
  empty: { textAlign: 'center', background: '#fff', borderRadius: 14, marginTop: 28, padding: 42, boxShadow: '0 4px 16px rgba(15,23,42,.08)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20, marginTop: 28 },
  card: { background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #dbeafe', boxShadow: '0 6px 18px rgba(15,23,42,.08)' },
  badge: { display: 'inline-block', margin: 0, padding: '5px 10px', borderRadius: 999, background: '#dcfce7', color: '#166534', fontSize: '.8rem', fontWeight: 700 },
  course: { color: '#172554', fontSize: '1.25rem', minHeight: 52 }, detail: { color: '#475569', margin: '9px 0' }, id: { color: '#64748b', fontSize: '.76rem', wordBreak: 'break-all' },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 },
  download: { border: 0, borderRadius: 8, background: '#2563eb', color: '#fff', padding: '10px 14px', cursor: 'pointer', fontWeight: 700, textDecoration: 'none' },
  verify: { color: '#1d4ed8', padding: '10px 0', textDecoration: 'none', fontWeight: 700 },
};

export default CertificatesPage;
