// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ✅ Removed unused nextLessonId state and its useEffect —
  // it was fetching enrollments/lessons on every login but never
  // actually rendering nextLessonId anywhere in the JSX.

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: '10px 20px',
    color: '#fff',
  };

  const linkGroup = {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
  };

  const buttonStyle = {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={{ ...linkStyle, fontSize: '20px', fontWeight: 'bold' }}>
        LMS
      </Link>

      <div style={linkGroup}>
        {!user && (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}

        {user?.role === 'student' && (
          <>
            <Link to="/student/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/student/browse" style={linkStyle}>Available Courses</Link>
            <Link to="/student/my-courses" style={linkStyle}>My Courses</Link>
            <Link to="/student/payments" style={linkStyle}>Payments</Link>
            <Link to="/student/reviews" style={linkStyle}>Reviews</Link>
            <Link to="/student/profile" style={linkStyle}>Profile</Link>
          </>
        )}

        {user?.role === 'instructor' && (
          <>
            <Link to="/instructor/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/instructor/my-courses" style={linkStyle}>Manage Courses</Link>
            <Link to="/instructor/reviews" style={linkStyle}>Reviews</Link>
            <Link to="/instructor/profile" style={linkStyle}>Profile</Link>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <Link to="/admin/dashboard" style={linkStyle}>Admin Panel</Link>
            <Link to="/admin/courses" style={linkStyle}>All Courses</Link>
            <Link to="/admin/users" style={linkStyle}>User Management</Link>
            <Link to="/admin/permissions" style={linkStyle}>Permissions</Link>
          </>
        )}

        {user && (
          <button onClick={handleLogout} style={buttonStyle}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;