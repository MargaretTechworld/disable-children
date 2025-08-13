import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async (token = null) => {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      setLoading(false);
      return null;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: { 'x-auth-token': authToken }
      });
      
      if (response.data) {
        setUser(response.data);
        setError(null);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
      setError(error.response?.data?.message || 'Failed to fetch user data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial user fetch on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userData = await fetchUser(response.data.token);
        
        if (userData) {
          return { success: true };
        }
      }
      
      return { 
        success: false, 
        error: 'Login failed. No token received.' 
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      logout,
      isAuthenticated: !!user,
      fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
