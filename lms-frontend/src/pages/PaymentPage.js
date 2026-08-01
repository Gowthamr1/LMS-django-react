import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Lock, Sparkles, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('credit_card');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axiosInstance.get(`/api/courses/courses/${courseId}/`);
        setCourse(res.data);
      } catch (err) {
        setMessage('Failed to load course info.');
        console.error(err);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleMockPayment = async () => {
    setMessage('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await axiosInstance.post(
        '/api/courses/payments/',
        { course: courseId },
        { timeout: 60000 },
      );
      setMessage('Payment successful! Enrolling in course...');
      setTimeout(() => navigate('/student/my-courses'), 2000);
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.detail ||
        (Array.isArray(data) ? data[0] : null) ||
        data?.non_field_errors?.[0] ||
        'Payment failed. Please try again.';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      <Link
        to={`/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Course Overview
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Order Summary Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-card p-6 border border-indigo-500/30 rounded-2xl relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Order Summary
            </div>

            {course ? (
              <div>
                <div className="w-full h-36 rounded-xl bg-slate-900 overflow-hidden mb-4 border border-slate-800">
                  {course.external_image_url || course.image ? (
                    <img src={course.external_image_url || course.image} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-950/40">
                      <GraduationCap className="w-10 h-10 text-indigo-400" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{course.description}</p>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Total Price:</span>
                  <span className="text-2xl font-extrabold text-white">${parseFloat(course.price || 0).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">Loading item...</div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <span>Instant Access. 256-bit encrypted checkout simulator.</span>
          </div>
        </div>

        {/* Payment Form Column */}
        <div className="md:col-span-7">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Payment Method</h2>
                  <p className="text-xs text-slate-400">Complete mock transaction to unlock course</p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs mb-6 flex items-center gap-2 border ${
                message.includes('successful') 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}>
                {message.includes('successful') ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                <span>{message}</span>
              </div>
            )}

            {/* Method Select */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setMethod('credit_card')}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  method === 'credit_card'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Credit Card
              </button>

              <button
                type="button"
                onClick={() => setMethod('paypal')}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  method === 'paypal'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" /> Instant Checkout
              </button>
            </div>

            {/* Mock Inputs */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  defaultValue="John Student"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Number</label>
                <input
                  type="text"
                  defaultValue="•••• •••• •••• 4242"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expiry Date</label>
                  <input type="text" defaultValue="12/28" className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white text-center" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">CVC</label>
                  <input type="text" defaultValue="888" className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white text-center" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMockPayment}
              disabled={loading || !course}
              className="w-full py-4 px-4 rounded-xl glass-button-primary text-sm font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Complete Payment (${course ? parseFloat(course.price || 0).toFixed(2) : '0.00'})
                </>
              )}
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
