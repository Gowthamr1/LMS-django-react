// frontend/src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  GraduationCap, LayoutDashboard, BookOpen, Award, CreditCard, 
  Star, User, LogOut, Menu, X, ShieldCheck, BookMarked, Users, KeyRound
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const renderNavLinks = () => {
    if (!user) {
      return (
        <>
          <Link
            to="/login"
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              isActive('/login')
                ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl text-sm font-semibold glass-button-primary"
          >
            Register
          </Link>
        </>
      );
    }

    if (user.role === 'student') {
      return (
        <>
          <NavLink to="/student/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/student/dashboard')} />
          <NavLink to="/student/browse" icon={BookOpen} label="Explore Courses" active={isActive('/student/browse')} />
          <NavLink to="/student/my-courses" icon={BookMarked} label="My Courses" active={isActive('/student/my-courses')} />
          <NavLink to="/student/certificates" icon={Award} label="Certificates" active={isActive('/student/certificates')} />
          <NavLink to="/student/payments" icon={CreditCard} label="Payments" active={isActive('/student/payments')} />
          <NavLink to="/student/reviews" icon={Star} label="Reviews" active={isActive('/student/reviews')} />
        </>
      );
    }

    if (user.role === 'instructor') {
      return (
        <>
          <NavLink to="/instructor/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/instructor/dashboard')} />
          <NavLink to="/instructor/my-courses" icon={BookOpen} label="Manage Courses" active={isActive('/instructor/my-courses')} />
          <NavLink to="/instructor/reviews" icon={Star} label="Reviews" active={isActive('/instructor/reviews')} />
        </>
      );
    }

    if (user.role === 'admin') {
      return (
        <>
          <NavLink to="/admin/dashboard" icon={LayoutDashboard} label="Admin Dashboard" active={isActive('/admin/dashboard')} />
          <NavLink to="/admin/courses" icon={BookOpen} label="All Courses" active={isActive('/admin/courses')} />
          <NavLink to="/admin/users" icon={Users} label="User Management" active={isActive('/admin/users')} />
          <NavLink to="/admin/permissions" icon={KeyRound} label="Permissions" active={isActive('/admin/permissions')} />
        </>
      );
    }

    return null;
  };

  const getProfileLink = () => {
    if (user?.role === 'instructor') return '/instructor/profile';
    return '/student/profile';
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/75 border-b border-slate-800/80 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Online LMS
            </span>
            <span className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase -mt-1">
              Elevate Skills
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {renderNavLinks()}
        </nav>

        {/* User Actions / Controls */}
        <div className="hidden lg:flex items-center gap-3">
          {user && (
            <>
              {/* Role Badge */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                user.role === 'admin' 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                  : user.role === 'instructor' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}>
                {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                {user.role}
              </span>

              {/* Profile Link */}
              <Link
                to={getProfileLink()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 text-xs font-bold border border-indigo-500/40">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium">{user.username}</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-fadeIn">
          <div className="flex flex-col gap-1">
            {renderNavLinks()}
          </div>
          {user && (
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <Link
                to={getProfileLink()}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-slate-200"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span>{user.username}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase font-semibold">
                  {user.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm font-medium text-rose-400 hover:text-rose-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
      <span>{label}</span>
    </Link>
  );
}

export default Navbar;
