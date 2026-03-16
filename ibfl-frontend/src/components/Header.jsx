import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header({ isAuthenticated, username, onLoginClick, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header>
      <div className="header-content">
        <div className="header-top">
          <div className="sponsor-logos">
            <div className="sponsor-logo"><img src="/Logos/SRKR.png" alt="" /></div>
            <div className="sponsor-logo"><img src="/Logos/SRKRFC.jpeg" alt="" /></div>
            <div className="sponsor-logo"><img src="/Logos/LOGOIBFL.jpeg" alt="" /></div>
          </div>
          <div className="logo-section">
            <div className="logo">IBFL</div>
            <span className="logo">SEASON 4</span>
          </div>
          <div className="auth-section">
            {isAuthenticated && <span>Welcome, {username}</span>}
            <button onClick={isAuthenticated ? onLogout : onLoginClick}>
              {isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
        <nav>
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/table" className={isActive('/table')}>Table</Link>
          <Link to="/matches" className={isActive('/matches')}>Matches</Link>
          <Link to="/teams" className={isActive('/teams')}>Teams</Link>
          {isAuthenticated && (
            <Link to="/admin" className={isActive('/admin')}>Admin</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;