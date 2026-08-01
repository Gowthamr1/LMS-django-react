import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LmsLoader from '../components/LmsLoader';
import { FolderKanban, PlusCircle, BookOpen, Clock, Signal, Sparkles, Video, ArrowRight } from 'lucide-react';

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/courses/')
      .then(res => setCourses(res.data))
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-violet-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-violet-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Instructor Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            My Published Courses 📚
          </h1>
          <p className="text-slate-400 text-sm">
            Manage curriculum, add new lessons, and update course information.
          </p>
        </div>

        <Link
          to="/instructor/create-course"
          className="px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold inline-flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Create Course
        </Link>
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <LmsLoader title="Loading your courses" subtitle="Retrieving your published content..." size="lg" />
      ) : courses.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <FolderKanban className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Courses Created Yet</h2>
          <p className="text-slate-400 text-sm mb-6">Start building your educational catalog!</p>
          <Link
            to="/instructor/create-course"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold"
          >
            <PlusCircle className="w-4 h-4" /> Create First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card overflow-hidden flex flex-col justify-between h-[360px] border border-slate-800/80 p-6 hover:border-violet-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-900 text-slate-300 border border-slate-800">
                    ${parseFloat(course.price || 0).toFixed(2)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-violet-300 transition-colors mb-2">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {course.description || 'No course description.'}
                </p>
              </div>

              <div>
                <div className="flex gap-2 text-[11px] font-semibold text-slate-400 mb-4 pt-3 border-t border-slate-800">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400" /> {course.duration || '6 Weeks'}</span>
                  <span className="flex items-center gap-1"><Signal className="w-3 h-3 text-indigo-400" /> {course.difficulty || 'Beginner'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/instructor/manage-lessons/${course.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" /> Manage Lessons
                  </Link>

                  <Link
                    to={`/courses/${course.id}`}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    title="Preview Course"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ManageCourses;
