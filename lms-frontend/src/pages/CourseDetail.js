import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Target, GraduationCap, Lock, Sparkles,
  CheckCircle2, Star, MessageSquareText, Hash, ArrowLeft, PlayCircle, ShieldCheck
} from 'lucide-react';
import LmsLoader from '../components/LmsLoader';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await axiosInstance.get(`/api/courses/courses/${id}/`);
        setCourse(response.data);
      } catch (err) {
        console.error('Error loading course:', err);
        setMessage('Failed to load course details');
      }
    };
    loadCourse();
  }, [id]);

  useEffect(() => {
    setReviewsLoading(true);
    axiosInstance.get(`/api/courses/reviews/?course=${id}`)
      .then(res => setReviews(res.data || []))
      .catch(err => console.error('Failed to load reviews:', err))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const handleEnroll = () => {
    navigate(`/student/payments/${id}`);
  };

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (!course) {
    return <LmsLoader title="Loading course" subtitle="Preparing course details..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      <Link
        to="/student/browse"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Browse Courses
      </Link>

      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/40 to-slate-900/95"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5" /> {course.category || 'General Education'}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            {course.title}
          </h1>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-lg font-extrabold text-white">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({reviews.length} student review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400" /> {course.duration || '6 Weeks'}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <Target className="w-4 h-4 text-indigo-400" /> {course.difficulty || 'Beginner'}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <GraduationCap className="w-4 h-4 text-violet-400" /> Instructor: {course.instructor_name || 'Expert Instructor'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Info */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="glass-card p-6 sm:p-8 border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Course Description
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {course.description || 'No detailed description available.'}
            </p>
          </div>

          {/* Syllabus */}
          <div className="glass-card p-6 sm:p-8 border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-violet-400" /> Curriculum & Syllabus
            </h2>

            <div className="space-y-3">
              {(course.lessons || []).length === 0 ? (
                <p className="text-xs text-slate-400">No lessons uploaded yet for this course.</p>
              ) : (
                (course.lessons || []).map((lesson, idx) => (
                  <div key={lesson.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
                        {idx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-white">{lesson.title}</h4>
                    </div>
                    <PlayCircle className="w-4 h-4 text-slate-500" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="glass-card p-6 sm:p-8 border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-amber-400" /> Student Reviews
            </h2>

            {reviewsLoading ? (
              <p className="text-xs text-slate-400">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No reviews yet — be the first to enroll and share your feedback!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{rev.student_name || 'Enrolled Student'}</span>
                      <div className="flex gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Sticky Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl sticky top-24">
            
            {course.is_enrolled ? (
              <div className="space-y-4 text-center">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  🎉 You are enrolled in this course
                </div>

                <button
                  onClick={() => navigate(`/lesson/${course.lessons?.[0]?.id}`)}
                  className="w-full py-3.5 px-4 rounded-xl glass-button-primary text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Start Learning Now
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-3xl font-extrabold text-white">${parseFloat(course.price || 0).toFixed(2)}</span>
                  <span className="text-xs text-slate-400 block mt-1">One-time payment • Full access</span>
                </div>

                <button
                  onClick={handleEnroll}
                  className="w-full py-4 px-4 rounded-xl glass-button-primary text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Enroll In Course
                </button>

                <div className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-300">
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full lifetime access</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Interactive quizzes & scores</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified QR PDF Certificate</p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
