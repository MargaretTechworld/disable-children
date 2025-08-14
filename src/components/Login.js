import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { mailOutline, lockClosedOutline, alertCircleOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (!result.success) {
        // More specific error messages based on the error type
        if (result.error?.includes('credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (result.error?.includes('network')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.div
              className="error-notification"
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="error-content">
                <IonIcon icon={alertCircleOutline} className="error-icon" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label"><span className="input-group-icon">
                <IonIcon icon={mailOutline} />
              </span>Email Address</label>
            <div className="input-group">
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="d-flex justify-content-between">
              <label htmlFor="password" className="form-label"> <span className="input-group-icon">
                <IonIcon icon={lockClosedOutline} />
              </span>Password</label>
            </div>
            <div className="input-group">
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </div>
          <div>
          <Link to="/forgot-password" className="text-sm text-primary text-decoration-none">
                Forgot password?
              </Link>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100 mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
