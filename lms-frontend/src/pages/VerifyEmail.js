import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, CheckCircle2, Loader2 } from 'lucide-react';
import axiosInstance from '../axiosInstance';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosInstance.post('/api/users/verify-email/', { email, otp });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    if (!email) {
      setError('Enter your email address first.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/users/resend-verification-email/', { email });
      setMessage(data.detail);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not resend the code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div style={{ ...styles.iconWrap, backgroundColor: '#dcfce7' }}>
            <CheckCircle2 size={40} color="#22c55e" />
          </div>
          <h2 style={styles.title}>Email verified!</h2>
          <p style={styles.text}>Your account is ready to use.</p>
          <Link to="/login" style={styles.button}>Go to Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div style={{ ...styles.iconWrap, backgroundColor: '#eff6ff' }}>
          <Mail size={32} color="#3b82f6" strokeWidth={1.75} />
        </div>
        <h2 style={styles.title}>Verify your email</h2>
        <p style={styles.text}>We sent a six-digit code to your email address. It expires in 10 minutes.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrap}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              style={styles.input}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div style={styles.otpWrap}>
            <KeyRound size={16} style={styles.otpIcon} />
            <input
              style={styles.otpInput}
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength="6"
              placeholder="000000"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              autoComplete="one-time-code"
              required
            />
          </div>

          <button style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? (
              <span style={styles.buttonContent}>
                <Loader2 size={18} style={styles.spin} /> Verifying...
              </span>
            ) : 'Verify Email'}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}

        <button style={styles.linkButton} type="button" onClick={handleResend} disabled={loading}>
          Resend verification code
        </button>
        <p style={styles.text}>Already verified? <Link to="/login" style={styles.inlineLink}>Log in</Link></p>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '80vh', padding: '2rem', fontFamily: "'Poppins', sans-serif",
  },
  card: {
    width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', borderRadius: '20px',
    backgroundColor: 'white', textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 12px rgba(0,0,0,0.06), 0 16px 28px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  iconWrap: {
    width: '72px', height: '72px', borderRadius: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '1.25rem',
  },
  title: { margin: '0 0 0.5rem', color: '#1e293b', fontSize: '1.4rem', fontWeight: '600' },
  text: { color: '#64748b', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', width: '100%' },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  input: {
    width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', border: '1px solid #e2e8f0',
    borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  otpWrap: { position: 'relative' },
  otpIcon: { position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  otpInput: {
    width: '100%', padding: '0.85rem 1rem', border: '1px solid #e2e8f0',
    borderRadius: '10px', fontSize: '1.4rem', textAlign: 'center', letterSpacing: '0.5rem',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  button: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    padding: '0.85rem 1.2rem', border: 0, borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', textDecoration: 'none',
  },
  buttonContent: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  spin: { animation: 'spin 1s linear infinite' },
  error: {
    marginTop: '1.25rem', padding: '0.75rem', borderRadius: '8px',
    color: '#991b1b', backgroundColor: '#fee2e2', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box',
  },
  message: {
    marginTop: '1.25rem', padding: '0.75rem', borderRadius: '8px',
    color: '#166534', backgroundColor: '#dcfce7', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box',
  },
  linkButton: {
    marginTop: '1.25rem', border: 0, padding: 0, background: 'none',
    color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
  },
  inlineLink: { color: '#3b82f6', fontWeight: '600' },
};

export default VerifyEmail;