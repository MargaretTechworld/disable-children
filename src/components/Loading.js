import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Loading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This component is used as a transition point during authentication
    // It will automatically redirect to the dashboard
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );
};

export default Loading;
