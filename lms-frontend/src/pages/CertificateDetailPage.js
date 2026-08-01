import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { Award, ArrowLeft, Download, ExternalLink, CheckCircle2, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-card p-8 border border-rose-500/20 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Certificate Unavailable</h2>
          <p className="text-slate-400 text-xs mb-6">{error}</p>
          <Link to="/student/certificates" className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold">
            Back to Certificates
          </Link>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading certificate details...</p>
      </div>
    );
  }

  const verifyUrl = `${window.location.origin}/verify-certificate/${certificateId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Link
          to="/student/certificates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Certificates
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/verify-certificate/${certificateId}`}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Public Verification
          </Link>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-2"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Official PDF
              </>
            )}
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {downloadError}
        </div>
      )}

      {/* Certificate Frame Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-8 sm:p-12 glass-panel border border-amber-500/30 shadow-2xl relative overflow-hidden bg-slate-950 text-center"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto border-4 border-amber-500/20 rounded-2xl p-6 sm:p-10 bg-slate-900/60 backdrop-blur-xl">
          
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10">
            <Award className="w-8 h-8" />
          </div>

          <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-2">
            Certificate of Accomplishment
          </p>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
            Online LMS Learning Achievement
          </h1>

          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">This is to certify that</p>
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-300 mb-6">
            {certificate.student_name}
          </h2>

          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">has successfully completed the course</p>
          <h3 className="text-lg sm:text-xl font-extrabold text-white mb-8 max-w-xl mx-auto leading-snug">
            "{certificate.course_title}"
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-800 text-left text-xs mb-8">
            <div>
              <p className="text-slate-400">Instructor: <strong className="text-white">{certificate.instructor_name}</strong></p>
              <p className="text-slate-400">Issued On: <strong className="text-white">{new Date(certificate.issued_at).toLocaleDateString()}</strong></p>
            </div>
            <div>
              <p className="text-slate-400">Status: <span className="text-emerald-400 font-bold">VERIFIED</span></p>
              <p className="text-slate-400 font-mono text-[11px] truncate">ID: {certificate.certificate_id}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Scannable QR Verification
              </p>
              <p className="text-[11px]">Scan QR code with any mobile camera to verify authenticity.</p>
            </div>

            <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-700 flex-shrink-0">
              <img src={qrImageUrl} alt="Certificate Verification QR Code" className="w-24 h-24" />
            </div>
          </div>

        </div>
      </motion.div>

    </div>
  );
}

export default CertificateDetailPage;