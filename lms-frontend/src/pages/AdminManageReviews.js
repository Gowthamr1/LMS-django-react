import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { Star, Trash2, Pencil, X, Check, MessageSquare, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    axiosInstance.get('/api/courses/reviews/')
      .then(res => {
        setReviews(res.data);
        setError('');
      })
      .catch(err => {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load reviews. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (reviewId) => {
    if(window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      axiosInstance.delete(`/api/courses/reviews/${reviewId}/`)
        .then(() => setReviews(prev => prev.filter(r => r.id !== reviewId)))
        .catch(err => {
          console.error('Failed to delete review:', err);
          alert('Failed to delete review. Please try again.');
        });
    }
  };

  const startEditing = (reviewId, currentComment) => {
    setEditingReviewId(reviewId);
    setEditedComment(currentComment);
  };

  const handleEditSubmit = (reviewId) => {
    axiosInstance.patch(`/api/courses/reviews/${reviewId}/`, { comment: editedComment })
      .then(() => {
        setReviews(prev =>
          prev.map(r => r.id === reviewId ? { ...r, comment: editedComment } : r)
        );
        setEditingReviewId(null);
        setEditedComment('');
      })
      .catch(err => {
        console.error('Failed to update review:', err);
        alert('Failed to update review. Please try again.');
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-amber-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Content Moderation
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Review Moderation 💬
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor, edit, or remove user-generated course reviews across the platform.
          </p>
        </div>

        {!loading && (
          <div className="px-4 py-2 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider self-start md:self-auto">
            {reviews.length} Review{reviews.length !== 1 ? 's' : ''} Stored
          </div>
        )}
      </motion.div>

      {loading ? (
        <LmsLoader title="Loading reviews" subtitle="Fetching public user reviews..." size="lg" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <MessageSquare className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Reviews Found</h2>
          <p className="text-slate-400 text-sm">There are no reviews currently submitted on the platform.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => {
            const isEditingThis = editingReviewId === review.id;

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden flex flex-col justify-between h-[300px] border border-slate-800 p-6 space-y-4"
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

                  {isEditingThis ? (
                    <textarea
                      rows={3}
                      value={editedComment}
                      onChange={e => setEditedComment(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 resize-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      "{review.comment || 'No written comment.'}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <strong className="text-slate-200">{review.student_name || review.student}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {isEditingThis ? (
                      <>
                        <button
                          onClick={() => handleEditSubmit(review.id)}
                          className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                          title="Save Edit"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingReviewId(null)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(review.id, review.comment)}
                          className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20"
                          title="Edit Comment"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default AdminManageReviews;
