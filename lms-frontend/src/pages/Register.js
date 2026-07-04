// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  select: {
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'white'
  },
  button: {
    padding: '0.8rem',
    backgroundColor: '#3182ce',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  error: {
    color: '#e53e3e',
    marginTop: '0.5rem',
    backgroundColor: '#fed7d7',
    padding: '0.75rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    whiteSpace: 'pre-line'  // so multi-field errors each show on their own line
  },
  success: {
    color: '#276749',
    backgroundColor: '#c6f6d5',
    padding: '0.75rem',
    borderRadius: '4px',
    marginTop: '0.5rem'
  }
};

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'student' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const result = await register(
        form.username, 
        form.email, 
        form.password, 
        form.role
      );

      if (result.success) {
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        // Show the actual DRF error (field-level messages)
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Account</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          name="username"
          type="text"
          placeholder="Username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select
          style={styles.select}
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
      </form>
    </div>
  );
}

export default Register;