import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { IonIcon } from '@ionic/react';
import { 
  trash, 
  pencil,
  key,
  refresh,
  alertCircle,
  checkmarkCircle,
  search,
  add
} from 'ionicons/icons';
import '../styles/components/UserManagement.css';

// Create a reusable axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const UserManagement = () => {
  const { user } = useAuth();
  console.log('UserManagement - Current user:', user);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const navigate = useNavigate();

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

  // Effect to handle user authentication and data fetching
  useEffect(() => {
    if (!user) {
      console.error('UserManagement: No authenticated user found');
      setError('User information not available. Please log in again.');
      setLoading(false);
      return;
    }

    console.log('UserManagement - User role:', user.role);
    
    if (user.role === 'super_admin') {
      console.log('User is super_admin, fetching users...');
      fetchUsers().catch(error => {
        console.error('Error in fetchUsers:', error);
        setError(error.message || 'Failed to load users');
        setLoading(false);
      });
    } else {
      console.log('User does not have permission to view this page');
      setError('You do not have permission to view this page');
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('Fetching users...');
      const response = await api.get('/users');
      
      console.log('Users API response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching users:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 403) {
        setError('You do not have permission to view users');
      } else if (!err.message.includes('Session expired')) {
        setError(`Failed to fetch users: ${err.message}`);
      }
      
      // Rethrow to be caught by the outer catch
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        setSuccess('User deleted successfully');
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete user');
      }
    }
  };

  const handleEdit = (userId) => {
    console.log('Navigating to edit user:', userId);
    // Use an absolute path to ensure consistent navigation
    navigate(`/dashboard/users/${userId}/edit`, { replace: true });
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s password? They will receive an email with a temporary password.')) {
      try {
        setResetUserId(userId);
        setIsResetting(true);
        setError('');
        setSuccess('');
        
        const response = await api.post(`/users/${userId}/reset-password`, {});
        
        if (response.data.success) {
          setSuccess('Password reset email sent successfully');
        } else {
          throw new Error(response.data.message || 'Failed to reset password');
        }
      } catch (err) {
        console.error('Error resetting password:', err);
        setError(err.response?.data?.message || err.message || 'Failed to reset password');
      } finally {
        setIsResetting(false);
        setResetUserId(null);
      }
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <div>Loading users...</div>
      {error && (
        <div className="alert alert-danger mt-3" style={{ maxWidth: '500px', width: '100%' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-state">
          <IonIcon icon={refresh} className="spinning" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management">
        <div className="error-state">
          <IonIcon icon={alertCircle} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <IonIcon icon={search} />
            <input 
              type="text" 
              placeholder="Search users..." 
              // Add search functionality here
            />
          </div>
          {(user?.role === 'superadmin' || user?.role === 'super_admin') && (
            <Link to="/dashboard/register" className="btn">
              <IonIcon icon={add} />
              Add New User
            </Link>
          )}
        </div>
      </div>
      
      {success && (
        <div className="success-state">
          <IonIcon icon={checkmarkCircle} />
          {success}
        </div>
      )}

      <div className="table-responsive">
        {users.length === 0 ? (
          <div className="empty-state">
            <h3>No Users Found</h3>
            <p>There are no users to display at the moment.</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {userItem.firstName?.[0] || userItem.email[0]}
                      </div>
                      <div>
                        <div className="user-name">
                          {`${userItem.firstName || ''} ${userItem.lastName || ''}`.trim() || 'N/A'}
                        </div>
                        <div className="user-email">
                          {userItem.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{userItem.email}</td>
                  <td>
                    <span className={`role-badge ${userItem.role}`}>
                      {userItem.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${userItem.isActive ? 'active' : 'inactive'}`}>
                      {userItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <div className="action-buttons">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(userItem.id);
                        }}
                        className="btn-icon btn-edit"
                        title="Edit User"
                      >
                        <IonIcon icon={pencil} />
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetPassword(userItem.id);
                        }}
                        className="btn-icon btn-reset"
                        title="Reset Password"
                        disabled={isResetting && resetUserId === userItem.id}
                      >
                        <IonIcon 
                          icon={isResetting && resetUserId === userItem.id ? refresh : key} 
                          className={isResetting && resetUserId === userItem.id ? 'spinning' : ''} 
                        />
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(userItem.id)}
                        className="btn-icon danger"
                        title="Delete User"
                        disabled={userItem.role === 'super_admin'}
                      >
                        <IonIcon icon={trash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
