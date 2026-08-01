import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, LayoutDashboard, LogIn, UserPlus, GraduationCap, Award, BookOpen, Sparkles, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl p-8 sm:p-14 mb-14 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-br from-slate-900/95 via-indigo-950/50 to-slate-950/95 text-center"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Next-Gen Learning Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Master Skills with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Interactive Courses & PDF Certificates
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
            Join our platform to learn at your own pace, complete quizzes, earn QR-verified certificates, or build and monetize your own educational courses.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link
                to={getDashboardPath()}
                className="px-6 py-3.5 rounded-2xl glass-button-primary text-base font-bold inline-flex items-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" /> Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-7 py-3.5 rounded-2xl glass-button-primary text-base font-bold inline-flex items-center gap-2"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-white font-semibold text-base hover:bg-slate-800 transition-all inline-flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-indigo-400" /> Sign In
                </Link>
              </>
            )}

            <Link
              to="/student/browse"
              className="px-6 py-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold text-base hover:bg-indigo-500/20 transition-all inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4" /> Browse Catalog
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <div className="glass-card p-6 border border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Expert-Crafted Lessons</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-quality video and text modules created by industry specialists across key domains.
          </p>
        </div>

        <div className="glass-card p-6 border border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Verifiable QR Certificates</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Earn instant PDF certificates equipped with scannable QR code verification upon course completion.
          </p>
        </div>

        <div className="glass-card p-6 border border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Interactive Quizzes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Test your knowledge after each lesson module with instant grading and score tracking.
          </p>
        </div>
      </div>

    </div>
  );
}

export default HomePage;
