import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { mailOutline, lockClosedOutline, alertCircleOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);

  // Track component mount state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sync auth error with local error state
  useEffect(() => {
    if (loginError) {
      setLocalError(loginError);
    }
  }, [loginError]);

  // Clear error when component mounts or when authLoading changes
  useEffect(() => {
    if (authLoading) {
      setLocalError('');
    }
  }, [authLoading]);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting) return;
    
    // Basic validation
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    setLocalError('');

    try {
      const result = await login(email, password);
      
      if (!isMounted.current) return;
      
      if (result && !result.success) {
        setLocalError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      if (!isMounted.current) return;
      console.error('Login error:', error);
      setLocalError(error.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>
        
        {localError && (
          <div className="error-notification" style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderLeft: '4px solid #c62828',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <IonIcon icon={alertCircleOutline} style={{ fontSize: '20px' }} />
            <span>{localError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <IonIcon icon={mailOutline} className="input-group-icon" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={authLoading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <IonIcon icon={lockClosedOutline} className="input-group-icon" />
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authLoading}
              minLength={6}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          
          <div className="form-group">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit"
            className="btn btn-primary btn-block"
            disabled={authLoading}
          >
            {authLoading ? 'Signing in...' : 'Sign In'}
          </button>
          

        </form>
      </div>
    </div>
  );
};

export default Login;
