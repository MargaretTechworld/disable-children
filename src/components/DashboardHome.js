import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Cards from './Cards';
import ChildList from './ChildList';
import '../styles/DashboardHome.css';

const DashboardHome = () => {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Log for debugging
    console.log('DashboardHome - User:', user);
    console.log('DashboardHome - Loading:', loading);
    console.log('DashboardHome - Error:', error);
    
    // Redirect if no user is logged in
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, loading, error, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>Welcome back, {user.firstName || 'User'}</h1>
        <p className='dashboard-subtitle'>Here's what's happening with your account today.</p>
      </div>
      
      <div className="cards-container">
        <Cards />
      </div>
      
      <div className="details">
        <ChildList />
      </div>
    </div>
  );
};

export default DashboardHome;
