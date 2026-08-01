import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Award, Calendar, User, GraduationCap, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function CertificateVerification() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    axios.get(`${apiBase}/api/courses/certificates/verify/${certificateId}/`)
      .then((response) => setCertificate(response.data))
      .catch(() => setError('This certificate could not be verified. Please check the URL link or Certificate ID.'));
  }, [certificateId]);

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg glass-card p-8 text-center border border-rose-500/30 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Certificate Not Verified</h1>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">{error}</p>
          <Link to="/" className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold inline-flex items-center gap-2">
            Return to Homepage <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm">Verifying certificate authenticity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Authentic Record</span>
              <h2 className="text-lg font-bold text-white">Verification Confirmed</h2>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
            certificate.valid 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
              : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
          }`}>
            {certificate.valid ? 'Verified Active' : 'Revoked'}
          </span>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Course Name</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">{certificate.course_title}</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <p className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Student: <strong className="text-white">{certificate.student_name}</strong></span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <GraduationCap className="w-4 h-4 text-violet-400" />
              <span>Instructor: <strong className="text-white">{certificate.instructor_name}</strong></span>
            </p>
            <p className="flex items-center gap-2 text-slate-300 sm:col-span-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Issue Date: <strong className="text-white">{new Date(certificate.issued_at).toLocaleDateString()}</strong></span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
            <span className="text-slate-400 block mb-0.5">Certificate UUID Token</span>
            <code className="font-mono text-indigo-300 break-all">{certificate.certificate_id}</code>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            Return to LMS Homepage
          </Link>
        </div>

      </motion.div>
    </div>
  );
}

export default CertificateVerification;
