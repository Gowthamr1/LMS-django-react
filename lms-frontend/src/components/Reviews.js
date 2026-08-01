import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { motion } from 'framer-motion';
import { Star, BookOpen, Pencil, Trash2, X, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import LmsLoader from './LmsLoader';

const Reviews = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [existingReviews, setExistingReviews] = useState({});
  const [drafts, setDrafts] = useState({});
  const [editing, setEditing] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/api/courses/enrollments/'),
      axiosInstance.get('/api/courses/reviews/'),
    ])
      .then(([enrollRes, reviewRes]) => {
        setEnrollments(enrollRes.data || []);
        const byCourse = {};
        (reviewRes.data || []).forEach(r => { byCourse[r.course] = r; });
        setExistingReviews(byCourse);
      })
      .catch(err => console.error('Failed to fetch enrollments/reviews:', err))
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (courseId, field, value) => {
    setDrafts(prev => ({ ...prev, [courseId]: { ...prev[courseId], [field]: value } }));
  };

  const startEdit = (courseId) => {
    const existing = existingReviews[courseId];
    setDrafts(prev => ({
      ...prev,
      [courseId]: { rating: String(existing.rating), text: existing.comment },
    }));
    setEditing(prev => ({ ...prev, [courseId]: true }));
    setMessages(prev => ({ ...prev, [courseId]: null }));
  };

  const cancelEdit = (courseId) => {
    setEditing(prev => ({ ...prev, [courseId]: false }));
  };

  const handleSubmit = async (courseId) => {
    const draft = drafts[courseId];
    if (!draft?.text || !draft?.rating) return;
    setLoading(true);
    const existing = existingReviews[courseId];

    try {
      let res;
      if (existing) {
        res = await axiosInstance.patch(`/api/courses/reviews/${existing.id}/`, {
          rating: draft.rating,
          comment: draft.text,
        });
      } else {
        res = await axiosInstance.post('/api/courses/reviews/', {
          course: courseId,
          comment: draft.text,
          rating: draft.rating,
        });
      }
      setExistingReviews(prev => ({ ...prev, [courseId]: res.data }));
      setEditing(prev => ({ ...prev, [courseId]: false }));
      setMessages(prev => ({ ...prev, [courseId]: existing ? 'Review updated!' : 'Review submitted!' }));
    } catch (err) {
      const detail = err.response?.data?.detail;
      setMessages(prev => ({ ...prev, [courseId]: detail || 'Failed to submit review.', error: true }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    const existing = existingReviews[courseId];
    if (!existing) return;
    if (!window.confirm('Delete your review for this course? This cannot be undone.')) return;

    setLoading(true);
    try {
      await axiosInstance.delete(`/api/courses/reviews/${existing.id}/`);
      setExistingReviews(prev => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
      setDrafts(prev => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
      setEditing(prev => ({ ...prev, [courseId]: false }));
      setMessages(prev => ({ ...prev, [courseId]: null }));
    } catch (err) {
      setMessages(prev => ({ ...prev, [courseId]: 'Failed to delete review.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-amber-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Feedback & Ratings
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Share Your Experience ⭐
        </h1>
        <p className="text-slate-400 text-sm">
          Your feedback helps instructors improve their courses and guides fellow students.
        </p>
      </motion.div>

      {fetching ? (
        <LmsLoader title="Loading reviews" subtitle="Preparing your feedback workspace..." size="lg" />
      ) : enrollments.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <BookOpen className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Enrolled Courses</h2>
          <p className="text-slate-400 text-sm">Enroll in a course first to leave a review!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...enrollments]
            .sort((a, b) => {
              const aReviewed = existingReviews[a.course] ? 1 : 0;
              const bReviewed = existingReviews[b.course] ? 1 : 0;
              return aReviewed - bReviewed;
            })
            .map((enrollment) => {
              const courseId = enrollment.course;
              const existing = existingReviews[courseId];
              const isEditing = !!editing[courseId];
              const draft = drafts[courseId] || {};
              const draftRating = Number(draft.rating || 0);
              const showForm = !existing || isEditing;
              const msg = messages[courseId];

              return (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card overflow-hidden flex flex-col justify-between h-[360px] border border-slate-800 p-6 space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        existing ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        {existing ? 'Reviewed' : 'Pending'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1 mb-2">
                      {enrollment.course_title}
                    </h3>

                    {msg && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 mb-3">
                        {msg}
                      </div>
                    )}

                    {showForm ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Rating (1 to 5 Stars)</label>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleChange(courseId, 'rating', String(star))}
                                className="p-1 text-amber-400 hover:scale-110 transition-transform"
                              >
                                <Star className={`w-5 h-5 ${star <= draftRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <textarea
                            rows={3}
                            value={draft.text || ''}
                            onChange={(e) => handleChange(courseId, 'text', e.target.value)}
                            placeholder="Write your honest course review..."
                            className="w-full p-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${star <= existing.rating ? 'fill-amber-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          "{existing.comment}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    {showForm ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => handleSubmit(courseId)}
                          disabled={loading || !draft.text || !draft.rating}
                          className="flex-1 py-2 px-3 rounded-xl glass-button-primary text-xs font-bold"
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : (existing ? 'Update Review' : 'Submit Review')}
                        </button>
                        {existing && (
                          <button
                            type="button"
                            onClick={() => cancelEdit(courseId)}
                            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <button
                          type="button"
                          onClick={() => startEdit(courseId)}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(courseId)}
                          className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

    </div>
  );
};

export default Reviews;
