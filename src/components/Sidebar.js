import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  homeOutline, 
  peopleOutline, 
  chatbubbleOutline, 
  helpOutline, 
  settingsOutline, 
  logOutOutline, 
  accessibilityOutline, 
  personAddOutline, 
  mailOutline,
  chevronDownOutline,
  chevronUpOutline,
  closeOutline
} from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/components/Sidebar.css';

const menuItems = [
  { 
    title: 'Dashboard', 
    path: '/dashboard', 
    icon: homeOutline,
    roles: ['admin', 'super_admin', 'user']
  },
  { 
    title: 'Add Child', 
    path: '/dashboard/childform',  
    icon: accessibilityOutline,
    roles: ['admin', 'super_admin', 'user']
  },
  { 
    title: 'Manage Children Data', 
    path: '/dashboard/manage-children',  
    icon: peopleOutline,
    roles: ['admin', 'super_admin']
  },
  { 
    title: 'Admin Message Center', 
    path: '/dashboard/message-center',  
    icon: mailOutline,
    roles: ['admin', 'super_admin', 'user']
  },
  { 
    title: 'User Management', 
    path: '/dashboard/user-management',  
    icon: peopleOutline,
    roles: ['super_admin']
  },
  { 
    title: 'Settings', 
    path: '/dashboard/settings',  
    icon: settingsOutline,
    roles: ['admin', 'super_admin', 'user']
  },
  { 
    title: 'Help & Support', 
    path: '/dashboard/help',  
    icon: helpOutline,
    roles: ['admin', 'super_admin', 'user']
  },
];

const Sidebar = ({ user, isOpen, onClose, onLogout, isMobile }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [expandedItems, setExpandedItems] = useState({});

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen, onClose]);

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleItem = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleNavClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  // Filter menu items based on user role - updated to handle super_admin
  const filteredMenuItems = menuItems.filter(item => {
    // Handle both 'superadmin' and 'super_admin' for backward compatibility
    const userRole = user?.role?.toLowerCase();
    const normalizedRoles = item.roles.map(role => 
      role === 'superadmin' ? 'super_admin' : role
    );
    
    return normalizedRoles.includes(userRole) || 
           (userRole === 'super_admin' && normalizedRoles.includes('superadmin'));
  });

  // Function to get display name from user object
  const getDisplayName = () => {
    if (!user) return 'User';
    
    // Check different possible name properties
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`sidebar ${isOpen ? 'open' : ''}`}
      data-theme={theme}
      aria-hidden={!isOpen}
    >
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          <div className="user-details">
            <p className="greeting">{getGreeting()}</p>
            <h3 className="username">{getDisplayName()}</h3>
          </div>
        </div>
        {isMobile && (
          <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
            <IonIcon icon={closeOutline} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {filteredMenuItems.map((item, index) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={handleNavClick}
              >
                <IonIcon icon={item.icon} className="nav-icon" />
                <span className="nav-text">{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <IonIcon icon={logOutOutline} className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
