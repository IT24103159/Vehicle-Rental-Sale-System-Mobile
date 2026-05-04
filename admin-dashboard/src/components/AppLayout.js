import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AppLayout.css';

const AppLayout = () => {
  const { logout, isAdmin } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <p className="brand-title">SAMARASINGHE</p>
          <p className="brand-subtitle">MOTORS</p>
        </div>

        <nav className="menu-list">
          {isAdmin ? (
            <NavLink to="/dashboard/users" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              User Management
            </NavLink>
          ) : null}
          <NavLink to="/dashboard/profile" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            Update Profile
          </NavLink>
        </nav>

        <button className="logout-link" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
