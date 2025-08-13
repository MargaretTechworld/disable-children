import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check for saved theme in localStorage, default to 'dark' if not found
    return localStorage.getItem('theme') || 'dark';
  });
  const [isMounted, setIsMounted] = useState(false);

  // Apply theme class to body on mount and when theme changes
  useEffect(() => {
    // Set initial theme class before React mounts to prevent flash
    document.body.className = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Mark as mounted to prevent flash of default theme
    setIsMounted(true);
    
    // Save theme preference
    localStorage.setItem('theme', theme);
    
    // Add class to body for theme-specific styles
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Don't render children until theme is applied to prevent flash
  if (!isMounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
