import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { Award, Sparkles, Calendar, User, CheckCircle2, Download, ExternalLink, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-amber-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Verified Accomplishments
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            My Certificates 🎓
          </h1>
          <p className="text-slate-400 text-sm">
            Your verified course completion records, complete with unique UUID QR code verification.
          </p>
        </div>
      </motion.div>

      {message && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-6">
          {message}
        </div>
      )}

      {loading ? (
        <LmsLoader title="Loading certificates" subtitle="Checking your achievements..." size="lg" />
      ) : certificates.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Certificates Earned Yet</h2>
          <p className="text-slate-400 text-sm mb-6">
            Complete all required video/text lessons and achieve passing quiz scores in an enrolled course to automatically unlock your certificate.
          </p>
          <Link
            to="/student/my-courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold"
          >
            Continue Learning
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <motion.div
              key={certificate.certificate_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden flex flex-col justify-between h-[320px] group border border-slate-800/80 hover:border-amber-500/40 p-6 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors mb-3">
                  {certificate.course_title}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Student: <strong className="text-white">{certificate.student_name}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Instructor: <strong className="text-white">{certificate.instructor_name}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Issued: {new Date(certificate.issued_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                <Link
                  to={`/student/certificates/${certificate.certificate_id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> View PDF
                </Link>

                <Link
                  to={`/verify-certificate/${certificate.certificate_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  Verify <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}

export default CertificatesPage;
