import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginError, setLoginError] = useState(null);

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
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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
      setError(null);
      setLoginError(null);
      
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      }, {
        // Prevent axios from throwing on HTTP error status
        validateStatus: (status) => status >= 200 && status < 500
      });

      // If we have a successful response with a token
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userData = await fetchUser(response.data.token);
        
        if (userData) {
          return { success: true };
        }
        return { 
          success: false, 
          error: 'Failed to fetch user data after login' 
        };
      }
      
      // Handle 400 Bad Request with error message
      if (response.status === 400 || response.status === 401) {
        const errorMessage = response.data?.message || 'Invalid email or password';
        setLoginError(errorMessage);
        return { 
          success: false, 
          error: errorMessage
        };
      }
      
      // Handle other error cases
      const errorMessage = response.data?.message || 'Login failed. Please try again.';
      setLoginError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
      
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setLoginError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
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
      loginError,
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
