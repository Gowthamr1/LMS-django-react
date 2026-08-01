import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import LmsLoader from '../components/LmsLoader';
import { BookOpen, Sparkles, GraduationCap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function CourseCatalog() {
  const { getToken } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('User not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    fetch('http://127.0.0.1:8000/api/courses/courses/', {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: Unauthorized or API error`);
        }
        return res.json();
      })
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [getToken]);

  if (loading) return <LmsLoader title="Loading catalog" subtitle="Retrieving course listings..." size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Full Curriculum
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Course Catalog 📚
        </h1>
        <p className="text-slate-400 text-sm">
          Browse all available courses across our learning platform.
        </p>
      </motion.div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="glass-card p-6 border border-slate-800 flex flex-col justify-between h-[220px] group hover:border-indigo-500/40 transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {course.description || 'No description available.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white">${parseFloat(course.price || 0).toFixed(2)}</span>
                <Link
                  to={`/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default CourseCatalog;
