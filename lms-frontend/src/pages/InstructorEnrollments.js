import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { Users, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function InstructorEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/enrollments/')
      .then(res => setEnrollments(res.data))
      .catch(err => { console.error('Failed to load enrollments:', err); setEnrollments([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-emerald-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-emerald-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Learner Tracking
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Student Enrollments 👥
          </h1>
          <p className="text-slate-400 text-sm">
            Track student registrations and completion status across your courses.
          </p>
        </div>

        {!loading && (
          <div className="px-4 py-2 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider self-start md:self-auto">
            {enrollments.length} Enrollment{enrollments.length !== 1 ? 's' : ''}
          </div>
        )}
      </motion.div>

      {loading ? (
        <LmsLoader title="Loading enrollments" subtitle="Retrieving student registrations..." size="lg" />
      ) : enrollments.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <Users className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Enrollments Yet</h2>
          <p className="text-slate-400 text-sm">
            When students enroll in your courses, their names and progress will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(e => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border border-slate-800 flex flex-col justify-between h-[230px] hover:border-emerald-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/40 text-xs">
                      {(e.student?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{e.student}</h3>
                      <p className="text-[11px] text-slate-400">Enrolled Student</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    e.completed 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                  }`}>
                    {e.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Course Enrolled</span>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{e.course_title || `Course #${e.course}`}</h4>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Enrolled: {new Date(e.enrolled_on).toLocaleDateString()}</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}

export default InstructorEnrollments;
