import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, Lock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      setSuccess(false);
      setMessage(getErrorMessage(error, 'Unable to update password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 border border-slate-800 rounded-2xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Security & Password</h3>
          <p className="text-xs text-slate-400">Update your account password using 2-step OTP verification</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs mb-6 flex items-center gap-2 border ${
          success 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
        }`}>
          {success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{message}</span>
        </div>
      )}

      {!otpSent ? (
        <form onSubmit={requestCode} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password to receive OTP"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl glass-button-primary text-xs font-bold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Request OTP Code</>}
          </button>
        </form>
      ) : (
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full py-3 px-4 rounded-xl glass-input text-center text-base tracking-widest font-mono text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full py-3 px-4 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full py-3 px-4 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl glass-button-primary text-xs font-bold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Password Change'}
          </button>
        </form>
      )}

    </div>
  );
}

export default ChangePassword;
