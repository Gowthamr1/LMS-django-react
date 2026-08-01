import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, GraduationCap, TrendingUp, Sparkles, Clock, Signal, ArrowRight, RefreshCw } from 'lucide-react';

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | free | paid

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    axiosInstance.get('/api/courses/courses/')
      .then(res => setCourses(res.data))
      .catch(err => console.error('Failed to fetch courses:', err))
      .finally(() => setLoading(false));
  };

  const filtered = courses.filter(c => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'free' && parseFloat(c.price || 0) === 0) ||
      (filter === 'paid' && parseFloat(c.price || 0) > 0);
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header Banner */}
      <motion.div 
        variants={headerVariants} 
        initial="hidden" 
        animate="visible"
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Explore Knowledge
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Discover Expert-Led Courses
          </h1>
          <p className="text-slate-400 text-base mb-6">
            Master new skills in programming, design, business, and analytics with interactive lessons and verified certificates.
          </p>

          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses by title or topic..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {['all', 'free', 'paid'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    filter === f
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading courses...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
          <p className="text-slate-400 text-sm mb-6">
            We couldn't find any courses matching your search query or filter.
          </p>
          <button
            onClick={() => { setSearch(''); setFilter('all'); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Reset Filters
          </button>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map(course => {
            const isFree = parseFloat(course.price || 0) === 0;
            const imageUrl = course.external_image_url || course.image || null;

            return (
              <motion.div
                key={course.id}
                variants={cardVariants}
                className="glass-card overflow-hidden flex flex-col justify-between h-[420px] group border border-slate-800/80 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                {/* Top Image Frame (Fixed Height) */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-indigo-400/50" />
                    </div>
                  )}

                  {/* Price Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md border ${
                      isFree
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-indigo-600/80 text-white border-indigo-400/40 shadow-lg'
                    }`}>
                      {isFree ? 'Free' : `$${course.price}`}
                    </span>
                  </div>

                  {/* Duration / Difficulty Badge */}
                  <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                    {course.difficulty && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-950/80 text-slate-300 border border-slate-700/80 backdrop-blur-md flex items-center gap-1">
                        <Signal className="w-3 h-3 text-indigo-400" />
                        {course.difficulty}
                      </span>
                    )}
                    {course.duration && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-950/80 text-slate-300 border border-slate-700/80 backdrop-blur-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {course.duration}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content Body (Equal Length Flex Column) */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors mb-1.5">
                      {course.title}
                    </h2>
                    <p className="text-xs text-indigo-400/90 font-medium mb-3 flex items-center gap-1">
                      Instructor: <span className="text-slate-300">{course.instructor_name || 'Expert Instructor'}</span>
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {course.description || 'No description available for this course.'}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      {course.lessons_count || 0} Lessons
                    </span>

                    <Link
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-400 transition-all group-hover:translate-x-0.5"
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </motion.div>
      )}

    </div>
  );
}

export default BrowseCourses;