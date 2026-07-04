import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const styles = {
  container: {
    maxWidth: '400px',
    margin: '5rem auto',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  title: {
    textAlign: 'center',
    color: '#2d3748',
    marginBottom: '2rem',
    fontSize: '2rem',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  input: {
    padding: '0.8rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#4299e1',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.2)'
    }
  },
  button: {
    padding: '0.8rem',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#3182ce',
      transform: 'translateY(-1px)'
    }
  },
  error: {
    color: '#e53e3e',
    textAlign: 'center',
    padding: '0.5rem',
    borderRadius: '4px',
    backgroundColor: '#fed7d7'
  }
};

function Login() {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      const dashboardPath = {
        admin: '/admin/dashboard',
        instructor: '/instructor/dashboard',
        student: '/student/dashboard'
      }[user.role];
      navigate(dashboardPath);
    }
  }, [user, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    try {
      const { data: { access, refresh } } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/token/`, 
        { username, password }
      );

      const { data: user } = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${access}` }
      });

      if (!user.role) throw new Error('User role not defined');

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      setUser?.(user);

      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid credentials');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Welcome Back</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          required
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button style={styles.button} type="submit">
          Sign In
        </button>
        {error && <div style={styles.error}>{error}</div>}
      </form>
    </div>
  );
}

export default Login;