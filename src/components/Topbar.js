import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { menuOutline, moon, sunny } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import '../styles/components/Topbar.css';

const Topbar = ({ onMenuClick, onLogout, user, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  const messages = [
    "Welcome to Disability Management System",
    "Every disabled child is important",
    "Together for inclusion and equal opportunity",
    "Empowering children with disabilities",
    "Accessibility is a right, not a privilege"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % messages.length);
    }, 12000); // Change message every 12 seconds
    return () => clearInterval(msgInterval);
  }, [messages.length]);

  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

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
        <div className="topbar-left-menu">
        <button 
          className="menu-btn" 
          onClick={onMenuClick}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <IonIcon icon={menuOutline} />
        </button>
        <h1 className="logo">Dashboard</h1>
        </div>
     

        {/* Scrolling text */}
        <div className="moving-text">
          <span key={currentIndex} className="fade-text">
            {messages[currentIndex]}
          </span>
        </div>
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
