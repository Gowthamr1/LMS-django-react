import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

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
      setMessage(`✅ Role updated to ${newRole} for user ID ${userId}`);
    } catch (err) {
      console.error("Error updating role:", err);
      setMessage("❌ Failed to update role.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Permissions Management</h2>
      {message && <p>{message}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Username</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Current Role</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.username}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.role}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <button onClick={() => handleRoleChange(user.id, 'student')}>Make Student</button>{' '}
                <button onClick={() => handleRoleChange(user.id, 'instructor')}>Make Instructor</button>{' '}
                <button onClick={() => handleRoleChange(user.id, 'admin')}>Make Admin</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: '20px', color: '#777' }}>
        ⚠️ These actions affect roles immediately. Always verify before promoting or demoting users.
      </p>
    </div>
  );
}

export default AdminPermissions;
