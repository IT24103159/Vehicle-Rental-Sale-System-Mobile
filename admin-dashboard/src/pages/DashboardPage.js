import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import UserTable from '../components/UserTable';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await userService.getAllUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const filteredUsers = users.filter((currentUser) => {
    const keyword = searchTerm.toLowerCase();
    return (
      currentUser.name.toLowerCase().includes(keyword)
      || currentUser.email.toLowerCase().includes(keyword)
      || currentUser.phone.toLowerCase().includes(keyword)
      || currentUser.role.toLowerCase().includes(keyword)
    );
  });

  const activeUsers = users.filter((currentUser) => currentUser.isActive).length;
  const blockedUsers = users.filter((currentUser) => !currentUser.isActive).length;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1>User Management</h1>
          <p>customers & admins • system records</p>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <span>TOTAL USERS</span>
          <h2>{users.length}</h2>
          <small>System accounts</small>
        </div>
        <div className="summary-card">
          <span>ACTIVE USERS</span>
          <h2>{activeUsers}</h2>
          <small>Regular status</small>
        </div>
        <div className="summary-card">
          <span>BLOCKED USERS</span>
          <h2>{blockedUsers}</h2>
          <small>Restricted access</small>
        </div>
      </section>

      <div className="section-head">
        <h3>User Directory • manage accounts</h3>
        <button onClick={handleRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <UserTable users={filteredUsers} onUpdate={handleRefresh} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
