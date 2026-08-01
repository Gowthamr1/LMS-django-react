import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { BookOpen, Trash2, Sparkles, GraduationCap, Clock, Signal } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminCourseApproval() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/courses/courses/')
      .then(res => {
        setCourses(res.data);
        setError('');
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to permanently delete this course? This action cannot be undone.')) {
      axiosInstance.delete(`/api/courses/courses/${id}/`)
        .then(() => setCourses(prev => prev.filter(course => course.id !== id)))
        .catch(err => {
          console.error('Failed to delete course:', err);
          alert('Failed to delete course. Please try again.');
        });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-violet-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-violet-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Content Moderation
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Course Management 📚
          </h1>
          <p className="text-slate-400 text-sm">
            Review, edit, and moderate published platform courses.
          </p>
        </div>

        {!loading && (
          <div className="px-4 py-2 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider self-start md:self-auto">
            {courses.length} Course{courses.length !== 1 ? 's' : ''} Published
          </div>
        )}
      </motion.div>

      {loading ? (
        <LmsLoader title="Loading courses" subtitle="Fetching system courses..." size="lg" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <BookOpen className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Courses Found</h2>
          <p className="text-slate-400 text-sm">No courses currently exist in the platform catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden flex flex-col justify-between h-[380px] border border-slate-800/80 hover:border-violet-500/40 p-6 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800">
                    ${parseFloat(course.price || 0).toFixed(2)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-violet-300 transition-colors mb-1.5">
                  {course.title}
                </h3>

                <p className="text-xs text-indigo-400 font-medium mb-3 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{course.instructor_name || 'Instructor'}</span>
                </p>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {course.description || 'No course description available.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
                <div className="flex gap-2 text-[11px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400" /> {course.duration || '6 Weeks'}</span>
                </div>

                <button
                  onClick={() => handleDelete(course.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}

export default AdminCourseApproval;
