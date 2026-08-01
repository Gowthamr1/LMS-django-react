import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PlayCircle, TrendingUp, Award, Star, CreditCard, Sparkles, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const dashboardCards = [
  {
    to: '/student/browse',
    icon: BookOpen,
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    title: 'Explore Courses',
    text: 'Discover expert-led courses across programming, business, and design.',
    badge: 'Catalog'
  },
  {
    to: '/student/my-courses',
    icon: PlayCircle,
    iconColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10 border-violet-500/20',
    title: 'My Courses',
    text: 'Access your enrolled courses and jump right into active lessons.',
    badge: 'Enrolled'
  },
  {
    to: '/student/progress',
    icon: TrendingUp,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Track Progress',
    text: 'Review your lesson completion rates, quiz scores, and stats.',
    badge: 'Analytics'
  },
  {
    to: '/student/certificates',
    icon: Award,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    title: 'My Certificates',
    text: 'View, download, and share your earned QR-verified course certificates.',
    badge: 'Credentials'
  },
  {
    to: '/student/payments',
    icon: CreditCard,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Payment Receipts',
    text: 'Check your payment history, invoices, and transaction records.',
    badge: 'Billing'
  },
  {
    to: '/student/reviews',
    icon: Star,
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
    title: 'My Reviews',
    text: 'Manage your ratings, course feedback, and instructor reviews.',
    badge: 'Feedback'
  },
];

function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Welcome Banner */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Student Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Welcome back, {user?.username || 'Learner'}! 👋
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Ready to continue your learning journey? Browse new courses or pick up where you left off.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/student/browse"
              className="px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold inline-flex items-center gap-2"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Grid of Action Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div key={index} variants={cardVariants}>
              <Link
                to={card.to}
                className="glass-card p-6 flex flex-col justify-between h-[230px] group border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 block"
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

                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.text}
                  </p>
                </div>

                <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 gap-1.5 pt-4 border-t border-slate-800/60">
                  <span>Open Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
}

export default StudentDashboard;
