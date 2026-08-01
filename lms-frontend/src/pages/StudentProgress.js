import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import LmsLoader from '../components/LmsLoader';
import { TrendingUp, BookOpen, CheckCircle, Award, Sparkles, PlayCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function StudentProgress() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/enrollments/')
      .then(res => setEnrollments(res.data || []))
      .catch(err => { console.error('Failed to load enrollments:', err); setEnrollments([]); })
      .finally(() => setLoading(false));
  }, []);

  const totalCompleted = enrollments.filter(e => e.completed).length;
  const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + (e.completed_lessons || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-cyan-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-cyan-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Learning Analytics
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Learning Progress 📊
          </h1>
          <p className="text-slate-400 text-sm">
            Track your completion metrics, lesson streaks, and course achievements.
          </p>
        </div>

        {!loading && enrollments.length > 0 && (
          <div className="flex gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xl font-extrabold text-indigo-400">{enrollments.length}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Enrolled</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xl font-extrabold text-emerald-400">{totalCompleted}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Completed</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xl font-extrabold text-cyan-400">{totalLessonsCompleted}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Lessons Done</p>
            </div>
          </div>
        )}
      </motion.div>

      {loading ? (
        <LmsLoader title="Loading progress" subtitle="Calculating your learning journey..." size="lg" />
      ) : enrollments.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Enrolled Courses</h2>
          <p className="text-slate-400 text-sm mb-6">
            Enroll in a course to start building your learning progress metrics!
          </p>
          <Link
            to="/student/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold"
          >
            Browse Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(enroll => {
            const pct = enroll.total_lessons > 0
              ? Math.round((enroll.completed_lessons / enroll.total_lessons) * 100)
              : 0;
            const isDone = enroll.completed || pct === 100;
            const lessonToOpen = enroll.completed
              ? enroll.first_lesson_id
              : (enroll.next_lesson_id || enroll.first_lesson_id);

            return (
              <motion.div
                key={enroll.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden flex flex-col justify-between h-[340px] border border-slate-800/80 p-6 hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      {enroll.total_lessons || 0} Lessons Total
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      isDone 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    }`}>
                      {isDone ? 'Completed' : `${pct}% Done`}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white line-clamp-1 mb-2">
                    {enroll.course_title}
                  </h3>

                  <p className="text-xs text-slate-400 mb-4">
                    Instructor: <strong className="text-slate-200">{enroll.instructor_name || 'Expert Instructor'}</strong>
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Lessons Completed</span>
                      <span className="text-cyan-400">{enroll.completed_lessons} / {enroll.total_lessons}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDone ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
                  {isDone ? (
                    <Link
                      to="/student/certificates"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <Award className="w-4 h-4" /> Certificate Ready
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">In Active Progress</span>
                  )}

                  {lessonToOpen && (
                    <Link
                      to={`/lesson/${lessonToOpen}`}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 transition-all"
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Continue
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default StudentProgress;
