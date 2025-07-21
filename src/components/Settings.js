import React from 'react';
import '../styles/Settings.css';

const Settings = ({ user, theme, setTheme }) => {

  const handleThemeChange = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>User Profile</h3>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={user.name} disabled />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user.email} disabled />
        </div>
        <button>Change Password</button>
      </div>

      <div className="settings-section">
        <h3>Preferences</h3>
        <div className="form-group-toggle">
          <label htmlFor="dark-mode-toggle">Dark Mode</label>
          <label className="switch">
            <input 
              type="checkbox" 
              id="dark-mode-toggle" 
              checked={theme === 'dark'}
              onChange={handleThemeChange}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

    </div>
  );
};

export default Settings;
