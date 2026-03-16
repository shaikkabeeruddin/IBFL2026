import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Table from './components/Table';
import Matches from './components/Matches';
import Teams from './components/Teams';
import TeamDetail from './components/TeamDetail';
import Admin from './components/Admin';
import Login from './components/Login';
import { verifyToken } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await verifyToken();
        setIsAuthenticated(true);
        setUsername(response.data.username);
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
  };

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUsername(user);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <Router>
      <div className="App">
        <Header 
          isAuthenticated={isAuthenticated}
          username={username}
          onLoginClick={() => setShowLogin(true)}
          onLogout={handleLogout}
        />
        
        {showLogin && (
          <Login 
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
          />
        )}

        <div className="hero">
          <h1>Inter Bhimavaram Football League</h1>
          <p>Season 4 - Organized by SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE</p>
          <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
            Proudly presented by SRKREC Football Club
          </p>
        </div>

        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/table" element={<Table />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route 
              path="/admin" 
              element={isAuthenticated ? <Admin /> : <Navigate to="/" />} 
            />
          </Routes>
        </div>

        <footer>
          <p>&copy; 2026 IBFL Season 4 - Inter Bhimavaram Football League</p>
          <p>Organized by SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE | SRKREC Football Club</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;