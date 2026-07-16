import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { useAuth } from '../contexts/AuthContext';

function ChangePassword() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;
    if (data?.detail) return data.detail;
    if (data) return Object.values(data).flat().join(' ');
    return fallback;
  };

  const requestCode = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);
    try {
      const response = await axiosInstance.post('/api/users/password-change/request-otp/', {
        old_password: oldPassword,
      });
      setOtpSent(true);
      setSuccess(true);
      setMessage(response.data.detail);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Unable to send a confirmation code.'));
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setSuccess(false);
      setMessage('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await axiosInstance.post('/api/users/password-change/', {
        old_password: oldPassword,
        new_password: newPassword,
        otp,
      });
      setSuccess(true);
      setMessage(response.data.detail);
      window.setTimeout(() => {
        logout();
        navigate('/login');
      }, 1200);
    } catch (error) {
      setSuccess(false);
      setMessage(getErrorMessage(error, 'Unable to change your password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Change Password</h2>
      <p style={styles.description}>Confirm your current password, then use the six-digit code sent to your email.</p>

      <form onSubmit={otpSent ? changePassword : requestCode}>
        <label style={styles.label}>Current Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={event => setOldPassword(event.target.value)}
          style={styles.input}
          required
        />

        {otpSent && (
          <>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              style={styles.input}
              required
            />
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              style={styles.input}
              required
            />
            <label style={styles.label}>Email Confirmation Code</label>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              style={styles.input}
              placeholder="6-digit code"
              maxLength="6"
              required
            />
          </>
        )}

        {message && <div style={{ ...styles.message, ...(success ? styles.success : styles.error) }}>{message}</div>}

        <div style={styles.actions}>
          <button type="submit" disabled={loading} style={styles.primaryButton}>
            {loading ? 'Please wait...' : otpSent ? 'Change Password' : 'Send Email Code'}
          </button>
          {otpSent && (
            <button type="button" disabled={loading} onClick={requestCode} style={styles.secondaryButton}>
              Send New Code
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

const styles = {
  card: { backgroundColor: 'white', borderRadius: '14px', padding: '1.75rem', marginTop: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', maxWidth: '620px' },
  title: { color: '#1e293b', fontSize: '1.35rem', margin: '0 0 0.4rem' },
  description: { color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem' },
  label: { display: 'block', color: '#334155', fontWeight: '700', margin: '0.9rem 0 0.4rem', fontSize: '0.9rem' },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', font: 'inherit' },
  actions: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' },
  primaryButton: { border: 'none', borderRadius: '8px', backgroundColor: '#2563eb', color: 'white', padding: '0.7rem 1rem', fontWeight: '700', cursor: 'pointer' },
  secondaryButton: { border: '1px solid #bfdbfe', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.7rem 1rem', fontWeight: '700', cursor: 'pointer' },
  message: { marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', lineHeight: 1.4 },
  success: { backgroundColor: '#dcfce7', color: '#166534' },
  error: { backgroundColor: '#fee2e2', color: '#b91c1c' },
};

export default ChangePassword;
