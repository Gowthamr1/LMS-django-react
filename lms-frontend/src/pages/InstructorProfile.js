import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import ChangePassword from '../components/ChangePassword';
import LmsLoader from '../components/LmsLoader';
import { BookOpen, Users, Calendar, Mail, Shield, RefreshCw, Sparkles, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

function InstructorProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ courses: 0, students: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [userRes, courseRes, enrollmentRes] = await Promise.all([
        axiosInstance.get('/api/users/me/'),
        axiosInstance.get('/api/courses/courses/'),
        axiosInstance.get('/api/courses/enrollments/'),
      ]);
      setProfile(userRes.data);

      setStats({
        courses: courseRes.data.length,
        students: enrollmentRes.data.length,
      });
    } catch (err) {
      console.error('Failed to load instructor profile info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <LmsLoader title="Loading your profile" subtitle="Preparing instructor workspace..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen space-y-8">
      
      {/* Header Profile Hero */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/95 via-indigo-950/40 to-slate-900/95"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 shadow-xl shadow-indigo-500/20 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-2xl text-indigo-400">
              {profile?.username?.[0]?.toUpperCase() || '?'}
            </div>
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" /> Instructor Portal
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {profile?.username}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-400" /> {profile?.email || 'N/A'}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" /> Role: <span className="font-bold text-white uppercase">{profile?.role}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" /> Joined: {new Date(profile?.date_joined || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            onClick={fetchProfile}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all self-end sm:self-auto"
            title="Refresh Profile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Courses Created */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-indigo-500/40 transition-all"
        >
          <div>
            <span className="text-4xl font-extrabold text-white tracking-tight">{stats.courses}</span>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
              Courses Created
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Published under your instructor account</p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-7 h-7" />
          </div>
        </motion.div>

        {/* Enrolled Students */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6 sm:p-8 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-violet-500/40 transition-all"
        >
          <div>
            <span className="text-4xl font-extrabold text-white tracking-tight">{stats.students}</span>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
              Enrolled Students
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Active learners across your courses</p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-7 h-7" />
          </div>
        </motion.div>

      </div>

      {/* Security Form Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <ChangePassword />
      </div>

    </div>
  );
}

export default InstructorProfile;
