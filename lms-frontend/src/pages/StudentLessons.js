import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import LmsLoader from '../components/LmsLoader';
import { PlayCircle, CheckCircle, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function StudentLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let enrolledCourseIds = [];

    axiosInstance.get('/api/courses/enrollments/')
      .then(res => {
        enrolledCourseIds = res.data.map(e => e.course);
        return axiosInstance.get('/api/courses/lessons/');
      })
      .then(res => {
        const filtered = res.data.filter(l => enrolledCourseIds.includes(l.course));
        setLessons(filtered);
      })
      .catch(err => { console.error('Failed to load lessons:', err); setLessons([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-violet-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-violet-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Enrolled Lessons
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Continue Learning 🚀
          </h1>
          <p className="text-slate-400 text-sm">
            Access your course lessons, watch video modules, and complete quizzes.
          </p>
        </div>

        {!loading && (
          <div className="px-4 py-2 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider self-start md:self-auto">
            {lessons.length} Lesson{lessons.length !== 1 ? 's' : ''} Available
          </div>
        )}
      </motion.div>

      {loading ? (
        <LmsLoader title="Loading lessons" subtitle="Finding your active modules..." size="lg" />
      ) : lessons.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Lessons Found</h2>
          <p className="text-slate-400 text-sm mb-6">
            Enroll in a course to start viewing lesson modules and videos.
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
          {lessons.map(lesson => {
            const done = lesson.progress === 100;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden flex flex-col justify-between h-[250px] border border-slate-800/80 p-6 hover:border-violet-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${done ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-violet-500/10 border-violet-500/20 text-violet-400'} border flex items-center justify-center`}>
                      {done ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      done ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-violet-500/20 text-violet-400 border-violet-500/40'
                    }`}>
                      {done ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-violet-300 transition-colors mb-2">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {lesson.content || 'No content preview available for this lesson.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400">Order: #{lesson.order || 1}</span>

                  <Link
                    to={`/lesson/${lesson.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 transition-all"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    {done ? 'Review' : 'Open Lesson'}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default StudentLessons;
