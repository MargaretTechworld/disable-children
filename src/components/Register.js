import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { personOutline, mailOutline, lockClosedOutline, shieldCheckmarkOutline, arrowBack } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { CircularProgress, Box, Typography, Container, Paper } from '@mui/material';

const Register = ({ onRegisterSuccess }) => {
  const location = useLocation();
  const isAdminFlow = location.pathname.includes('dashboard/register');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user', // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { firstName, lastName, email, password, role } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required. Please log in as an admin.');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      const response = await axios.post(
        'http://localhost:5000/api/users/register',
        {
          firstName,
          lastName,
          email,
          password,
          role
        },
        config
      );

      // If this is a self-registration (not common for admin-created users)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);

        // Notify parent component of successful registration and login
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // If this is an admin creating a user, just show success message
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'user',
        });

        // Show success message
        setError('');
        // In a real app, you might want to show a success toast/modal here
        alert('User registered successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 20, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          {isAdminFlow && (
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Link 
                to="/dashboard/user-management" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                <IonIcon icon={arrowBack} style={{ marginRight: 8 }} />
                Back to Users
              </Link>
            </Box>
          )}
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {isAdminFlow ? 'Add New User' : 'Create an Account'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAdminFlow ? 'Fill in the details below to create a new user account' : 'Join our community today'}
          </Typography>
        </Box>

        {error && (
          <Box 
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: 'error.light',
              color: 'error.contrastText',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <IonIcon icon="warning" style={{ fontSize: '1.2rem' }} />
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography component="label" htmlFor="firstName" variant="body2" fontWeight="medium" display="block" mb={0.5}>
                  First Name <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    '&:focus-within': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                    }
                  }}
                >
                  <IonIcon icon={personOutline} style={{ marginRight: 8, color: 'text.secondary' }} />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={firstName}
                    onChange={onChange}
                    required
                    disabled={loading}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      backgroundColor: 'trans'
                    }}
                    placeholder="Enter first name"
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography component="label" htmlFor="lastName" variant="body2" fontWeight="medium" display="block" mb={0.5}>
                  Last Name <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    '&:focus-within': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                    }
                  }}
                >
                  <IonIcon icon={personOutline} style={{ marginRight: 8, color: 'text.secondary' }} />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={lastName}
                    onChange={onChange}
                    required
                    disabled={loading}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      backgroundColor: 'transparent'
                    }}
                    placeholder="Enter last name"
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography component="label" htmlFor="email" variant="body2" fontWeight="medium" display="block" mb={0.5}>
              Email Address <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                mb: 2,
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                }
              }}
            >
              <IonIcon icon={mailOutline} style={{ marginRight: 8, color: 'text.secondary' }} />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                disabled={loading}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  backgroundColor: 'transparent'
                }}
                placeholder="Enter email address"
              />
            </Box>

            <Typography component="label" htmlFor="password" variant="body2" fontWeight="medium" display="block" mb={0.5}>
              Password <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                mb: 0.5,
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                }
              }}
            >
              <IonIcon icon={lockClosedOutline} style={{ marginRight: 8, color: 'text.secondary' }} />
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                minLength={6}
                disabled={loading}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  backgroundColor: 'transparent'
                }}
                placeholder="Create a password (min 6 characters)"
              />
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Password must be at least 6 characters long
            </Typography>

            {isAdminFlow && (
              <Box sx={{ mb: 2 }}>
                <Typography component="label" htmlFor="role" variant="body2" fontWeight="medium" display="block" mb={0.5}>
                  Role <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    '&:focus-within': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                    }
                  }}
                >
                  <IonIcon icon={shieldCheckmarkOutline} style={{ marginRight: 8, color: 'text.secondary' }} />
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={onChange}
                    disabled={loading}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      backgroundColor: 'transparent',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      padding: '4px 0',
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                  <IonIcon 
                    icon="chevron-down" 
                    style={{ 
                      marginLeft: 'auto', 
                      color: 'text.secondary',
                      fontSize: '1rem'
                    }} 
                  />
                </Box>
              </Box>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '10px 16px',
                fontSize: '0.9375rem',
                fontWeight: 500,
                textTransform: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                '&:hover': {
                  backgroundColor: '#1565c0'
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e',
                  cursor: 'not-allowed'
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={16} color="inherit" thickness={5} />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
