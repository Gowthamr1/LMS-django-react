// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const getToken = () => localStorage.getItem('access_token');

  const register = async (username, email, password, role) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        // DRF returns field-level errors like:
        // { "username": ["already exists"], "password": ["too common"] }
        // Flatten them all into one readable string and throw it.
        const messages = Object.entries(data)
          .map(([field, errors]) => {
            const errList = Array.isArray(errors) ? errors.join(' ') : errors;
            return `${field}: ${errList}`;
          })
          .join('\n');
        console.error('Registration errors:', data); // full detail in console
        throw new Error(messages || 'Registration failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      logout, 
      register, 
      getToken, 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);