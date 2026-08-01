import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { CreditCard, DollarSign, BookOpen, Calendar, CheckCircle2, Sparkles, Receipt, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-emerald-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-emerald-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Transaction Receipts
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Payment History 💳
          </h1>
          <p className="text-slate-400 text-sm">
            Review your course purchases, receipts, and order history.
          </p>
        </div>

        {!loading && payments.length > 0 && (
          <div className="flex gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-2xl font-extrabold text-emerald-400">${totalSpent.toFixed(2)}</span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Invested</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-2xl font-extrabold text-indigo-400">{uniqueCourses}</span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Paid Courses</p>
            </div>
          </div>
        )}
      </motion.div>

      {loading ? (
        <LmsLoader title="Loading payments" subtitle="Retrieving transaction records..." size="lg" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      ) : payments.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Receipt className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Transactions Yet</h2>
          <p className="text-slate-400 text-sm mb-6">
            When you purchase paid courses, your receipts will be securely stored here.
          </p>
          <Link
            to="/student/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">{payment.course_title || `Course #${payment.course}`}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Paid & Enrolled
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Paid on {formatDate(payment.paid_on || payment.created_at)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-right">
                  <span className="text-xl font-extrabold text-white">${parseFloat(payment.amount).toFixed(2)}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">USD</span>
                </div>

                <Link
                  to={`/courses/${payment.course}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-white text-xs font-bold hover:bg-indigo-600 transition-all"
                >
                  View Course
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default PaymentsPage;
