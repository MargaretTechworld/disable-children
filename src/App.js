import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';
import ChildForm from './components/ChildForm';
import ManageChildrenView from './components/ManageChildrenView';
import UserManagement from './components/UserManagement';
import EditUser from './components/EditUser';
import AdminMessageCenter from './components/AdminMessageCenter';
import Settings from './components/Settings';
import Help from './components/Help';
import ChatWidget from './components/Chat/ChatWidget';
import WelcomeScreen from './components/WelcomeScreen';
import './styles/global.css';

// Wrapper component to handle theme application
const ThemeWrapper = ({ children }) => {
  const { theme } = useTheme();
  
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    document.body.className = theme;
  }, [theme]);
  
  return children;
};

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with the current location to return to after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // User doesn't have the required role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Chat widget component with auth check
const ChatWidgetWithAuth = () => {
  const { user } = useAuth();
  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    return null;
  }
  return <ChatWidget user={user} />;
};

// Main App component
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <WelcomeScreen />
            )
          } 
        />
        
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="auth-page">
                <Login />
              </div>
            )
          } 
        />
        
        <Route 
          path="/register" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="auth-page">
                <Register />
              </div>
            )
          } 
        />
        
        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="childform" element={<ChildForm />} />
          <Route path="manage-children" element={<ManageChildrenView />} />
          <Route path="message-center" element={<AdminMessageCenter />} />
          <Route 
            path="user-management" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="users/:userId/edit" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <EditUser />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="settings" 
            element={
              <ProtectedRoute>
                <Settings user={user} />
              </ProtectedRoute>
            } 
          />
          <Route path="help" element={<Help />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <ChatWidgetWithAuth />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeWrapper>
          <AppContent />
        </ThemeWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;