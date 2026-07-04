import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        alert('Failed to update user status. Please try again.');
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Manage Users</h2>
      
      {loading ? (
        <div style={styles.loading}>Loading users...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : users.length === 0 ? (
        <div style={styles.empty}>No users found.</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>{user.email || 'N/A'}</td>
                  <td style={styles.td}>{user.role}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.status,
                      ...(user.is_active ? styles.active : styles.inactive)
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={{
                        ...styles.button,
                        ...(user.is_active ? styles.buttonDanger : styles.buttonSuccess)
                      }}
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    color: '#2c3e50',
    marginBottom: '1.5rem'
  },
  tableContainer: {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white'
  },
  th: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    textAlign: 'left',
    borderBottom: '2px solid #e9ecef'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #e9ecef'
  },
  tr: {
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f8f9fa'
    }
  },
  status: {
    padding: '0.25rem 0.5rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'inline-block'
  },
  active: {
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  inactive: {
    backgroundColor: '#f8d7da',
    color: '#721c24'
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'opacity 0.2s',
    ':hover': {
      opacity: 0.9
    }
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
    color: 'white'
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6c757d'
  },
  error: {
    padding: '2rem',
    textAlign: 'center',
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    borderRadius: '4px'
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6c757d'
  }
};

export default AdminUserManagement;