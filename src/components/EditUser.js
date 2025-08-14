import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { IonIcon } from '@ionic/react';
import { 
  save, 
  arrowBack, 
  alertCircle, 
  checkmarkCircle,
  key,
  refresh
} from 'ionicons/icons';

// Create a reusable axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const EditUser = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    isActive: true
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Add request interceptor to include token in every request
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['x-auth-token'] = token;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle 401 errors
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear invalid token and redirect to login
          localStorage.removeItem('token');
          navigate('/login', { state: { from: '/dashboard/user-management' } });
          return Promise.reject({ ...error, message: 'Session expired. Please log in again.' });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Cleanup interceptors
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        const userData = response.data;
        
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email,
          role: userData.role || 'user',
          isActive: userData.isActive !== undefined ? userData.isActive : true
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
        setError(err.response?.data?.message || 'Failed to fetch user data');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    } else {
      setLoading(false);
      setError('No user ID provided');
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      await api.put(`/users/${userId}`, formData);
      
      setSuccess('User updated successfully');
      setTimeout(() => {
        navigate('/dashboard/user-management');
      }, 1500);
    } catch (err) {
      console.error('Error updating user:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) {
      return;
    }
    
    try {
      setIsResetting(true);
      setError('');
      
      await api.post(`/users/${userId}/reset-password`, {});
      
      setSuccess('Password reset email sent successfully');
    } catch (err) {
      console.error('Error resetting password:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <IonIcon icon={refresh} className="spinning" />
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <IonIcon icon={alertCircle} />
        <p>{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/dashboard/user-management')}
        >
          Back to User Management
        </button>
      </div>
    );
  }

  return (
    <div className="edit-user-container">
      <div className="page-header">
        <button 
          className="btn btn-link" 
          onClick={() => navigate('/dashboard/user-management')}
        >
          <IonIcon icon={arrowBack} /> Back to Users
        </button>
        <h2>Edit User</h2>
      </div>
      
      {success && (
        <div className="alert alert-success">
          <IonIcon icon={checkmarkCircle} /> {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-control"
            disabled={currentUser?.id === userId} // Don't let users change their own role
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            {currentUser?.role === 'super_admin' && (
              <option value="super_admin">Super Admin</option>
            )}
          </select>
        </div>
        
        <div className="form-group form-check">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="form-check-input"
          />
          <label className="form-check-label" htmlFor="isActive">
            Active
          </label>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-outline-secondary me-2"
            onClick={handlePasswordReset}
            disabled={isResetting}
          >
            <IonIcon icon={isResetting ? refresh : key} className={isResetting ? 'spinning' : ''} />
            {isResetting ? 'Resetting...' : 'Reset Password'}
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
