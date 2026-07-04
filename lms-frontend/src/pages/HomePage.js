import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
  const { user } = useAuth();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh',
    textAlign: 'center',
    padding: '20px',
  };

  const headingStyle = {
    fontSize: '3rem',
    marginBottom: '20px',
    color: '#2c3e50',
  };

  const subheadingStyle = {
    fontSize: '1.5rem',
    marginBottom: '30px',
    color: '#34495e',
  };

  const buttonGroup = {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '5px',
    textDecoration: 'none',
    color: '#fff',
    backgroundColor: '#2980b9',
  };

  const secondaryButton = {
    ...buttonStyle,
    backgroundColor: '#27ae60',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Welcome to LMS</h1>
      {user?.role === 'student' && (
          <p style={subheadingStyle}>
        Learn at your own pace.
      </p>
        )}

        {user?.role === 'instructor' && (
          <p style={subheadingStyle}>
        Teach what you know. Manage courses easily.
      </p>
        )}

        {user?.role === 'admin' && (
          <p style={subheadingStyle}>
        Manage courses easily.
      </p>
        )}


      <div style={buttonGroup}>
        <Link to="/student/browse" style={buttonStyle}>Explore Courses</Link>


        



        {!user && (
          <>
            <Link to="/login" style={buttonStyle}>Login</Link>
            <Link to="/register" style={secondaryButton}>Register</Link>
          </>
        )}



        {user?.role === 'student' && (
          <Link to="/student/dashboard" style={buttonStyle}>Go to Dashboard</Link>
        )}

        {user?.role === 'instructor' && (
          <Link to="/instructor/dashboard" style={buttonStyle}>Go to Instructor Panel</Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/admin/dashboard" style={buttonStyle}>Go to Admin Panel</Link>
        )}
      </div>
    </div>
  );
}

export default HomePage;
