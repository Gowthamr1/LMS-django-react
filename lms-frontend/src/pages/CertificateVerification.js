import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function CertificateVerification() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/courses/certificates/verify/${certificateId}/`)
      .then((response) => setCertificate(response.data))
      .catch(() => setError('This certificate could not be verified. Check the link or Certificate ID.'));
  }, [certificateId]);

  if (error) return <main style={styles.page}><section style={{ ...styles.card, borderColor: '#fecaca' }}><h1>Certificate not verified</h1><p>{error}</p></section></main>;
  if (!certificate) return <main style={styles.page}><p>Verifying certificate...</p></main>;

  return (
    <main style={styles.page}>
      <section className="liquid-glass-card" style={styles.card}>
        <p style={certificate.valid ? styles.valid : styles.invalid}>{certificate.valid ? 'Certificate verified' : 'Certificate revoked'}</p>
        <h1 style={styles.title}>{certificate.course_title}</h1>
        <p><strong>Student:</strong> {certificate.student_name}</p>
        <p><strong>Instructor:</strong> {certificate.instructor_name}</p>
        <p><strong>Issue date:</strong> {new Date(certificate.issued_at).toLocaleDateString()}</p>
        <p style={styles.id}><strong>Certificate ID:</strong> {certificate.certificate_id}</p>
      </section>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: '#f8fafc' },
  card: { maxWidth: 620, width: '100%', background: '#fff', border: '2px solid #86efac', borderRadius: 16, padding: 36, boxShadow: '0 12px 32px rgba(15,23,42,.12)' },
  valid: { color: '#166534', background: '#dcfce7', display: 'inline-block', padding: '7px 12px', borderRadius: 999, fontWeight: 700 },
  invalid: { color: '#991b1b', background: '#fee2e2', display: 'inline-block', padding: '7px 12px', borderRadius: 999, fontWeight: 700 },
  title: { color: '#172554' }, id: { color: '#64748b', wordBreak: 'break-all' },
};

export default CertificateVerification;
