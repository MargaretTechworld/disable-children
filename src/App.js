import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';

const App = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <div className={`app-container ${theme}`}>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser} />} />
          <Route 
            path="/dashboard/*" 
            element={loggedInUser ? 
              <DashboardLayout user={loggedInUser} theme={theme} setTheme={setTheme} /> : 
              <Navigate to="/login" />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;