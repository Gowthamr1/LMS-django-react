import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import LmsLoader from '../components/LmsLoader';
import { Users, ShieldCheck, CheckCircle2, XCircle, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/users/all/')
      .then(res => {
        setUsers(res.data);
        setError('');
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = (userId, isActive) => {
    axiosInstance.patch(`/api/users/${userId}/`, { is_active: !isActive })
      .then(() => {
        setUsers(prev =>
          prev.map(user =>
            user.id === userId ? { ...user, is_active: !isActive } : user
          )
        );
      })
      .catch(err => {
        console.error('Failed to update user status:', err);
        alert('Failed to update user status.');
      });
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-8 glass-panel border border-rose-500/20 shadow-2xl bg-gradient-to-r from-slate-900/90 via-rose-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Administration
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            User Management 👥
          </h1>
          <p className="text-slate-400 text-sm">
            Control user access, roles, and account activation states across the platform.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
        </div>
      </motion.div>

      {loading ? (
        <LmsLoader title="Loading users" subtitle="Preparing user directory..." size="lg" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-800">
          <Users className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Users Found</h2>
          <p className="text-slate-400 text-sm">No accounts match your current search query.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/40 text-xs">
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <span>{u.username}</span>
                    </td>
                    <td className="p-4 text-slate-300">{u.email}</td>
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
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                        u.is_active 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          u.is_active
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUserManagement;
