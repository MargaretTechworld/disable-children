import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { menuOutline, moon, sunny } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import '../styles/components/Topbar.css';

const Topbar = ({ onMenuClick, onLogout, user, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  
  // Function to get display name from user object
  const getDisplayName = () => {
    if (!user) return 'User';
    
    // Check for firstName and lastName first
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    
    // Fallback to other possible name properties
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    
    return 'User';
  };
  
  // Function to get user initials for avatar
  const getUserInitials = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="menu-btn" 
          onClick={onMenuClick}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <IonIcon icon={menuOutline} />
        </button>
        <h1 className="logo">Dashboard</h1>
      </div>
      
      <div className="topbar-right">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <IonIcon icon={theme === 'dark' ? sunny : moon} />
        </button>
        
        <div className="user-menu">
          <span className="username">
            {getDisplayName()}
          </span>
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          
          <div className="dropdown-menu">
            <button onClick={onLogout} className="dropdown-item">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Topbar);