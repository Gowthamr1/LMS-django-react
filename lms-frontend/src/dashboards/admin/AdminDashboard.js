import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, BookOpen, BarChart3, KeyRound, MessageSquare, PlusCircle, Video, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const adminCards = [
  {
    to: '/admin/users',
    icon: Users,
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    title: 'User Management',
    description: 'Manage user accounts, roles (Student, Instructor, Admin), and account activations.',
    badge: 'Users'
  },
  {
    to: '/admin/courses',
    icon: BookOpen,
    iconColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10 border-violet-500/20',
    title: 'Course Management',
    description: 'Overview of all courses, edit details, approve new submissions, or clean up courses.',
    badge: 'Courses'
  },
  {
    to: '/admin/stats',
    icon: BarChart3,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Analytics & Insights',
    description: 'Track platform stats, student growth, active courses, and revenue performance.',
    badge: 'Metrics'
  },
  {
    to: '/admin/permissions',
    icon: KeyRound,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Access Control',
    description: 'Manage system roles, granular API permissions, and access policies.',
    badge: 'Security'
  },
  {
    to: '/admin/manage-reviews',
    icon: MessageSquare,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    title: 'Review Moderation',
    description: 'Monitor student reviews, ratings, and moderate public feedback.',
    badge: 'Moderation'
  },
  {
    to: '/admin/create-course',
    icon: PlusCircle,
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
    title: 'Create System Course',
    description: 'Develop official platform courses and set up curriculum modules.',
    badge: 'Create'
  },
];

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Admin Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-rose-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-rose-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Administration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Admin Control Center 🛡️
          </h1>
          <p className="text-slate-400 text-sm">
            Manage overall system operations, user registrations, course approvals, platform analytics, and security settings.
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <Link
            to="/admin/users"
            className="px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold inline-flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> Manage Users
          </Link>
        </div>
      </motion.div>

      {/* Grid of Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={card.to}
                className="glass-card p-6 flex flex-col justify-between h-[230px] group border border-slate-800/80 hover:border-rose-500/40 transition-all duration-300 block"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${card.bgColor} border flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-semibold text-rose-400 group-hover:text-rose-300 gap-1.5 pt-4 border-t border-slate-800/60">
                  <span>Manage Section</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

export default AdminDashboard;
