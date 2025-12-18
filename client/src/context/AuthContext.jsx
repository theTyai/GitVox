import React, { createContext, useState, useEffect } from 'react';
import api, { BASE_URL } from '../api'; // Import the centralized API helper

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    api.get('/api/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Login: Redirects to the Backend OAuth Endpoint
  // We use BASE_URL here because this is a browser redirect, not an AJAX call
  const login = () => {
    window.location.href = `${BASE_URL}/auth/github`;
  };

  // Logout: meaningful session destruction
  const logout = async () => {
    try {
      await api.post('/api/logout');
      setUser(null);
      // Optional: Redirect to landing page after logout
      // window.location.href = '/'; 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};