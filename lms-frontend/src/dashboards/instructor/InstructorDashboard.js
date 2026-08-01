import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Video, FolderKanban, Users, Star, Brain, Sparkles, ArrowRight, PlusCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const features = [
  {
    title: 'Create Course',
    icon: PlusCircle,
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    path: '/instructor/create-course',
    description: 'Develop new courses, set pricing, duration, and difficulty level.'
  },
  {
    title: 'Upload Lesson',
    icon: Video,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    path: '/instructor/create-lesson',
    description: 'Add video lessons, downloadable materials, and content modules.'
  },
  {
    title: 'Manage Courses',
    icon: FolderKanban,
    iconColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10 border-violet-500/20',
    path: '/instructor/my-courses',
    description: 'Edit your published courses, update order, and manage lessons.'
  },
  {
    title: 'Student Enrollments',
    icon: Users,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    path: '/instructor/enrollments',
    description: 'Track student registrations, completion status, and learner lists.'
  },
  {
    title: 'Course Reviews',
    icon: Star,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    path: '/instructor/reviews',
    description: 'Monitor student feedback, ratings, and course satisfaction.'
  },
  {
    title: 'Quiz Builder',
    icon: Brain,
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
    path: '/instructor/quiz',
    description: 'Create interactive assessments and multiple-choice quizzes.'
  },
];

function InstructorDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 glass-panel border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Instructor Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Welcome, {user?.username || 'Instructor'}! 🎓
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your courses, create new content modules, monitor student progress, and review student feedback.
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <Link
            to="/instructor/create-course"
            className="px-5 py-2.5 rounded-xl glass-button-primary text-sm font-semibold inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> New Course
          </Link>
        </div>
      </motion.div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={feature.path}
                className="glass-card p-6 flex flex-col justify-between h-[230px] group border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 block"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${feature.bgColor} border flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 gap-1.5 pt-4 border-t border-slate-800/60">
                  <span>Access Control</span>
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

export default InstructorDashboard;
