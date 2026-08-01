import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { BarChart3, Users, BookOpen, GraduationCap, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminStats() {
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    Promise.all([
      axiosInstance.get('/api/users/all/'),
      axiosInstance.get('/api/courses/courses/'),
      axiosInstance.get('/api/courses/enrollments/')
    ])
      .then(([userRes, courseRes, enrollRes]) => {
        setStats({
          users: userRes.data.length || 0,
          courses: courseRes.data.length,
          enrollments: enrollRes.data.length,
        });
        setLastUpdated(new Date().toLocaleTimeString());
        setError('');
      })
      .catch(err => {
        console.error('Failed to load stats:', err);
        setError('Failed to load some statistics. Showing available data.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-cyan-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-cyan-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Platform Intelligence
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Platform Analytics 📊
          </h1>
          <p className="text-slate-400 text-sm">
            Real-time metric breakdown of total users, published courses, and student enrollments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Updated: {lastUpdated || 'Just now'}</span>
          <button
            onClick={fetchStats}
            className="px-4 py-2 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
          </button>
        </div>
      </motion.div>

      {loading ? (
        <LmsLoader title="Loading statistics" subtitle="Calculating platform analytics..." size="lg" />
      ) : (
        <>
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-6">
              {error}
            </div>
          )}

          {/* Stat Counter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-3xl font-extrabold text-white">{stats.users}</span>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Total Users</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card p-6 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-3xl font-extrabold text-white">{stats.courses}</span>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Active Courses</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-3xl font-extrabold text-white">{stats.enrollments}</span>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Total Enrollments</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
            </motion.div>
          </div>
        </>
      )}

    </div>
  );
}

export default AdminStats;
