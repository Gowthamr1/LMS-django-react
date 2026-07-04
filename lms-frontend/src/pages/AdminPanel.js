// frontend/src/pages/AdminPanel.js
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

function AdminPanel() {
  const { getToken } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users/', {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, [getToken]);

  return (
    <div>
      <h2>Admin Panel</h2>
      <h3>All Users</h3>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.username} - {u.role}</li>
        ))}
      </ul>
      {/* Additional admin controls could go here */}
    </div>
  );
}

export default AdminPanel;
