import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WelcomeScreen.css';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1>Welcome to the Application</h1>
        <p>Your journey to supporting children with disabilities starts here.</p>
        <button onClick={() => navigate('/login')}>Get Started</button>
      </div>
    </div>
  );
};

export default WelcomeScreen;