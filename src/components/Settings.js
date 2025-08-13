import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IonIcon } from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline, 
  checkmarkCircleOutline, 
  alertCircleOutline,
  personOutline,
  mailOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import '../styles/Settings.css';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {  
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    console.log('Settings - User data:', user);
    console.log('User name:', user?.name);
    console.log('User email:', user?.email);
    console.log('User role:', user?.role);
  }, [user]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.className = theme;
      localStorage.setItem('theme', theme);
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.className = '';
      }
    };
  }, [theme]);

  const handleThemeChange = (e) => {
    toggleTheme();
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const userResponse = await axios.get('http://localhost:5000/api/users/me', {
        headers: { 'x-auth-token': token }
      });

      if (!userResponse.data || !userResponse.data._id) {
        throw new Error('Failed to verify user session');
      }

      const response = await axios.put(
        `http://localhost:5000/api/users/${userResponse.data._id}/password`,
        { currentPassword, newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Password changed successfully' 
        });
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
      
    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`settings-container ${theme}`}>
      <h2 className="settings-title">Settings</h2>
      
      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button 
          className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
      </div>
      
      <div className="settings-content">
        {activeTab === 'profile' && (
          <div className="settings-section">
            <h3>Profile Information</h3>
            <div className="form-group">
              <label>Name</label>
              <div className="input-with-icon">
                <IonIcon icon={personOutline} className="input-icon" />
                <input 
                  type="text" 
                  value={user?.name || user?.email?.split('@')[0] || 'User'} 
                  disabled 
                  aria-label="User's name"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="input-with-icon">
                <IonIcon icon={mailOutline} className="input-icon" />
                <input 
                  type="email" 
                  value={user?.email || 'N/A'} 
                  disabled 
                  aria-label="User's email"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Role</label>
              <div className="input-with-icon">
                <IonIcon icon={shieldCheckmarkOutline} className="input-icon" />
                <input 
                  type="text" 
                  value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ') : 'N/A'}
                  disabled 
                  aria-label="User's role"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-section">
            <h3>Change Password</h3>
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                <IonIcon icon={message.type === 'success' ? checkmarkCircleOutline : alertCircleOutline} />
                {message.text}
              </div>
            )}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <div className="input-with-icon">
                  <IonIcon icon={lockClosedOutline} className="input-icon" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                  >
                    <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <div className="input-with-icon">
                  <IonIcon icon={lockClosedOutline} className="input-icon" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="input-with-icon">
                  <IonIcon icon={lockClosedOutline} className="input-icon" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="form-group-toggle">
              <div>
                <label>Dark Mode</label>
                <p className="setting-description">Enable dark mode for better visibility in low-light conditions</p>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="themeToggle"
                  checked={theme === 'dark'}
                  onChange={handleThemeChange}
                />
                <label className="form-check-label" htmlFor="themeToggle">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Language</label>
              <select className="form-control">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
