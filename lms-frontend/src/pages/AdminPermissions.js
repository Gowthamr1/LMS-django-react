import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { KeyRound, Shield, User, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminPermissions() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/users/all/')
      .then(res => setUsers(res.data))
      .catch(err => console.error("Failed to load users:", err));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.patch(`/api/users/${userId}/`, { role: newRole });
      setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
      setMessage(`Role updated to ${newRole} for user ID ${userId}`);
    } catch (err) {
      console.error("Error updating role:", err);
      setMessage("Failed to update role.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-8 glass-panel border border-emerald-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-emerald-950/30 to-slate-900/90"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Access Control
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Permissions & Role Management 🔑
        </h1>
        <p className="text-slate-400 text-sm">
          Promote or demote user roles across Student, Instructor, and Admin permissions.
        </p>
      </motion.div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Current Role</th>
                <th className="p-4 text-right">Role Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/40 text-xs">
                      {u.username[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p>{u.username}</p>
                      <p className="text-[11px] font-normal text-slate-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'admin' 
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                        : u.role === 'instructor' 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                        : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleChange(u.id, 'student')}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-semibold"
                      >
                        Student
                      </button>
                      <button
                        onClick={() => handleRoleChange(u.id, 'instructor')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-semibold"
                      >
                        Instructor
                      </button>
                      <button
                        onClick={() => handleRoleChange(u.id, 'admin')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-[11px] font-semibold"
                      >
                        Admin
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default AdminPermissions;
