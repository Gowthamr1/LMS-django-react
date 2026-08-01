import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { Star, MessageSquare, BookOpen, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';

function InstructorReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    axiosInstance.get('/api/courses/reviews/')
      .then(res => {
        setReviews(res.data);
        const total = res.data.reduce((sum, r) => sum + r.rating, 0);
        setAverageRating(res.data.length ? (total / res.data.length).toFixed(1) : 0);
      })
      .catch(err => { console.error('Failed to fetch reviews:', err); setReviews([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-amber-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Student Ratings
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Course Reviews ⭐
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor feedback, ratings, and course reviews submitted by your students.
          </p>
        </div>

        {!loading && reviews.length > 0 && (
          <div className="flex gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-2xl font-extrabold text-amber-400">{reviews.length}</span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Reviews</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-2xl font-extrabold text-emerald-400">{averageRating} / 5</span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Avg Rating</p>
            </div>
          </div>
        )}
      </motion.div>

      {loading ? (
        <LmsLoader title="Loading reviews" subtitle="Gathering student feedback..." size="lg" />
      ) : reviews.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <MessageSquare className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Reviews Submitted Yet</h2>
          <p className="text-slate-400 text-sm">
            When students review your courses, their ratings and comments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden flex flex-col justify-between h-[280px] border border-slate-800 p-6"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                    ))}
                  </div>

                  <span className="text-[11px] font-bold text-slate-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-1 mb-2">
                  {review.course_title || `Course #${review.course}`}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  "{review.comment || 'No written comment provided.'}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <strong className="text-slate-200">{review.student_name || 'Enrolled Student'}</strong>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}

export default InstructorReviews;
