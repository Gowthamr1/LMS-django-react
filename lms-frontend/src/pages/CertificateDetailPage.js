import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

function CertificateDetailPage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/courses/certificates/')
      .then((response) => {
        const matchingCertificate = response.data.find((item) => item.certificate_id === certificateId);
        if (!matchingCertificate) throw new Error('Certificate not found');
        setCertificate(matchingCertificate);
      })
      .catch(() => setError('This certificate is not available for your account.'));
  }, [certificateId]);

  const handleDownload = async () => {
    setDownloadError('');
    setDownloading(true);
    try {
      // Fetches the real reportlab-generated PDF from the backend and
      // triggers an actual file save — this is the file that should be
      // shared/printed/kept, not the on-screen preview below.
      const response = await axiosInstance.get(
        `/api/courses/certificates/${certificateId}/download/`,
        { responseType: 'blob' },
      );
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `LMS-Certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setDownloadError('We could not download this certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (error) return <main style={styles.page}><p style={styles.error}>{error}</p></main>;
  if (!certificate) return <main style={styles.page}><p style={styles.loading}>Loading certificate...</p></main>;

  // Same verification URL the backend's QR code encodes
  // (settings.FRONTEND_URL + /verify-certificate/<id>).
  const verifyUrl = `${window.location.origin}/verify-certificate/${certificateId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <main style={styles.page}>
      <div style={styles.actions}>
        <Link to="/student/certificates" style={styles.back}>
          &larr; Back to certificates
        </Link>
        <button type="button" onClick={handleDownload} disabled={downloading} style={styles.downloadBtn}>
          {downloading ? 'Preparing PDF...' : 'Download PDF Certificate'}
        </button>
      </div>

      {downloadError && <p style={styles.downloadErrorText}>{downloadError}</p>}

      {/* Preview only — mirrors certificate_pdf.py's layout so what the
          student sees on screen matches the downloaded PDF. The real file
          is generated server-side by reportlab, fetched above. */}
      <article style={styles.outerBorder}>
        <div style={styles.innerBorder}>

          <p style={styles.brand}>LMS LEARNING ACHIEVEMENT</p>
          <h1 style={styles.heading}>Certificate of Completion</h1>

          <p style={styles.bodyText}>This certifies that</p>
          <h2 style={styles.studentName}>{certificate.student_name}</h2>
          <div style={styles.underline} />

          <p style={styles.bodyText}>has successfully completed all course requirements for</p>
          <h3 style={styles.courseTitle}>{certificate.course_title}</h3>
          <p style={styles.requirements}>All lessons completed and required quizzes passed with 100% course progress.</p>

          <div style={styles.footerRow}>
            <div style={styles.signatureBlock}>
              <div style={styles.signatureLine} />
              <strong style={styles.instructorName}>{certificate.instructor_name}</strong>
              <span style={styles.caption}>Instructor - Digitally Signed</span>
            </div>

            <div style={styles.detailsBlock}>
              <div>
                <span style={styles.detailLabel}>Issued</span>
                <p style={styles.detailValue}>
                  {new Date(certificate.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <span style={styles.detailLabel}>Certificate ID</span>
                <p style={styles.detailValueSmall}>{certificate.certificate_id}</p>
              </div>
            </div>

            <div style={styles.qrBlock}>
              <img src={qrImageUrl} alt="Scan to verify this certificate" style={styles.qrImage} />
              <span style={styles.caption}>Scan to verify</span>
            </div>
          </div>

          <p style={styles.footerNote}>
            This certificate can be independently verified online using its ID or QR code.
          </p>
        </div>
      </article>
    </main>
  );
}

const SERIF = "'Times New Roman', Times, serif";

const styles = {
  page: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: "'Inter', 'Segoe UI', sans-serif',",
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  back: {
    color: '#0f172a',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  downloadBtn: {
    border: 'none',
    borderRadius: '6px',
    background: '#1D4ED8',
    color: '#fff',
    padding: '10px 20px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  downloadErrorText: {
    color: '#991b1b',
    background: '#fee2e2',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: '500',
  },

  /* Mirrors: pdf.rect(24,24,...) stroke #1D4ED8 width 5 */
  outerBorder: {
    background: '#F8FAFC',
    border: '5px solid #1D4ED8',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    padding: '12px',
  },
  /* Mirrors: pdf.rect(36,36,...) stroke #93C5FD width 1 */
  innerBorder: {
    border: '1px solid #93C5FD',
    padding: '48px 56px 36px',
    textAlign: 'center',
    minHeight: '520px',
    display: 'flex',
    flexDirection: 'column',
  },

  brand: {
    color: '#1E3A8A',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontWeight: '700',
    fontSize: '0.95rem',
    letterSpacing: '1.5px',
    margin: '0 0 18px',
  },
  heading: {
    fontFamily: SERIF,
    fontWeight: '700',
    fontSize: '2.6rem',
    color: '#0F172A',
    margin: '0 0 28px',
  },
  bodyText: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#475569',
    fontSize: '1rem',
    margin: '0 0 6px',
  },
  studentName: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#1D4ED8',
    fontSize: '2.2rem',
    margin: '6px 0 10px',
  },
  underline: {
    height: '1px',
    background: '#60A5FA',
    width: '350px',
    maxWidth: '80%',
    margin: '0 auto 22px',
  },
  courseTitle: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontWeight: '700',
    color: '#0F172A',
    fontSize: '1.4rem',
    margin: '8px 0 16px',
  },
  requirements: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#475569',
    fontSize: '0.8rem',
    maxWidth: '520px',
    margin: '0 auto',
  },

  footerRow: {
    marginTop: 'auto',
    paddingTop: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '16px',
  },
  signatureBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '230px',
  },
  signatureLine: {
    width: '180px',
    borderTop: '1px solid #94A3B8',
    marginBottom: '10px',
  },
  instructorName: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#1E3A8A',
    fontSize: '1.15rem',
  },
  caption: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#64748B',
    fontSize: '0.7rem',
    marginTop: '4px',
  },
  detailsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    textAlign: 'left',
  },
  detailLabel: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontWeight: '700',
    color: '#0F172A',
    fontSize: '0.78rem',
  },
  detailValue: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#334155',
    fontSize: '0.85rem',
    margin: '2px 0 0',
  },
  detailValueSmall: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#334155',
    fontSize: '0.65rem',
    margin: '2px 0 0',
    wordBreak: 'break-all',
  },
  qrBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  qrImage: {
    width: '72px',
    height: '72px',
  },

  footerNote: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#94A3B8',
    fontSize: '0.7rem',
    marginTop: '18px',
    marginBottom: 0,
  },

  error: {
    color: '#991b1b',
    background: '#fee2e2',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    color: '#475569',
    fontSize: '1.2rem',
    marginTop: '40px',
  },
};

export default CertificateDetailPage;