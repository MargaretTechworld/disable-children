import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/DashboardLayout.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1025);

  useEffect(() => {
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1025;
      setIsMobile(isMobileView);
      
      if (isMobileView && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [window.location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`dashboard-layout ${theme}`} data-theme={theme}>
      <Topbar 
        user={user} 
        onMenuClick={toggleSidebar}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
      />
      
      <Sidebar 
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        isMobile={isMobile}
      />
      
      <main className="main-content">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;