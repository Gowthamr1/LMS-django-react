import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import ChangePassword from './ChangePassword';
import LmsLoader from './LmsLoader';
import { User, Mail, Shield, BookOpen, CheckCircle, Clock, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/api/users/me/'),
      axiosInstance.get('/api/courses/enrollments/'),
    ])
      .then(([profileRes, enrollRes]) => {
        setProfile(profileRes.data);
        setEnrollments(enrollRes.data);
      })
      .catch(err => console.error('Error fetching profile:', err))
      .finally(() => setLoading(false));
  }, []);

  const completedCount = enrollments.filter(e => e.completed).length;
  const inProgressCount = enrollments.length - completedCount;

  if (loading) {
    return <LmsLoader title="Loading your profile" subtitle="Preparing your learning metrics..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl border border-indigo-500/20 shadow-2xl mb-8 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/40">
            {profile?.username ? profile.username[0].toUpperCase() : 'U'}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Learner Profile
            </div>
            <h1 className="text-3xl font-extrabold text-white">{profile?.username}</h1>
            <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-indigo-400" /> {profile?.email}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Role: {profile?.role}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">{enrollments.length}</span>
            <p className="text-xs text-slate-400 font-medium">Total Courses Enrolled</p>
          </div>
        </div>

        <div className="glass-card p-6 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">{completedCount}</span>
            <p className="text-xs text-slate-400 font-medium">Completed Courses</p>
          </div>
        </div>

        <div className="glass-card p-6 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">{inProgressCount}</span>
            <p className="text-xs text-slate-400 font-medium">Courses In Progress</p>
          </div>
        </div>
      </div>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Enrolled Overview */}
        <div className="glass-card p-6 sm:p-8 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Recent Enrollments
            </h3>

            {enrollments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No enrolled courses yet.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {enrollments.slice(0, 5).map(enroll => (
                  <div key={enroll.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{enroll.course_title}</h4>
                      <p className="text-[11px] text-slate-400">{enroll.completed_lessons} of {enroll.total_lessons} lessons done</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      enroll.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {enroll.completed ? 'Done' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <Link to="/student/my-courses" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
              View All Enrolled Courses →
            </Link>
          </div>
        </div>

        {/* Change Password Form */}
        <div>
          <ChangePassword />
        </div>

      </div>

    </div>
  );
}

export default Profile;
