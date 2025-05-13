import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/users/stats/dashboard');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Stores</h3>
          <div className="stat-value">{stats.totalStores}</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Ratings</h3>
          <div className="stat-value">{stats.totalRatings}</div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <a href="/admin/users" className="action-button">
            Manage Users
          </a>
          <a href="/admin/stores" className="action-button">
            Manage Stores
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;