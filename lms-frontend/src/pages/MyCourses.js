import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, PlayCircle, Award, Sparkles, ArrowRight, GraduationCap } from 'lucide-react';
import LmsLoader from '../components/LmsLoader';

function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/enrollments/')
      .then(res => setEnrollments(res.data || []))
      .catch(err => { console.error('Failed to load enrollments:', err); setEnrollments([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Enrolled Courses
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
            My Learning Journey
          </h1>
          <p className="text-slate-400 text-sm">
            Pick up right where you left off and track your progress toward certification.
          </p>
        </div>

        {!loading && (
          <div className="px-4 py-2 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider self-start md:self-auto">
            {enrollments.length} Course{enrollments.length !== 1 ? 's' : ''} Enrolled
          </div>
        )}
      </div>

      {loading ? (
        <LmsLoader title="Loading your courses" subtitle="Bringing your learning progress together..." size="lg" />
      ) : enrollments.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Enrolled Courses Yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Explore our course catalog and enroll to start building your skills today!
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
            const isCompleted = enroll.completed || pct === 100;
            const lessonToOpen = enroll.completed
              ? enroll.first_lesson_id
              : (enroll.next_lesson_id || enroll.first_lesson_id);

            return (
              <motion.div
                key={enroll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden flex flex-col justify-between h-[340px] group border border-slate-800/80 hover:border-indigo-500/40 p-6 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                      isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    }`}>
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors mb-2">
                    {enroll.course_title}
                  </h3>

                  <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                    <span>Instructor:</span>
                    <span className="text-slate-200 font-medium">{enroll.instructor_name || 'Expert Instructor'}</span>
                  </p>

                  {/* Progress Bar Container */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-300">Course Progress</span>
                      <span className={isCompleted ? 'text-emerald-400' : 'text-indigo-400'}>{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {enroll.completed_lessons || 0} of {enroll.total_lessons || 0} lessons finished
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                  {isCompleted ? (
                    <Link
                      to="/student/certificates"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <Award className="w-4 h-4" /> View Certificate
                    </Link>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Continuous Learning
                    </span>
                  )}

                  {lessonToOpen ? (
                    <Link
                      to={`/lesson/${lessonToOpen}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-400 transition-all"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      {pct > 0 ? 'Continue' : 'Start'}
                    </Link>
                  ) : (
                    <Link
                      to={`/courses/${enroll.course}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all"
                    >
                      Course Info
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

export default MyCourses;
