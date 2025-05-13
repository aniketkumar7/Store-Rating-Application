import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StoreOwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }

        // Check if user is a store owner
        if (user.role !== 'store_owner') {
          setError('You are not registered as a store owner.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          'http://localhost:5000/api/stores/dashboard/owner',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStoreData(response.data);
      } catch (err) {
        console.error('Store data fetch error:', err);
        setError('Failed to load store data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [user]);


  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= roundedRating ? 'filled' : 'empty'}`}>
          {i <= roundedRating ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }

    return stars;
  };

  if (loading) {
    return <div className="loading">Loading store data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!storeData) {
    return (
      <div className="store-owner-dashboard">
        <h1>Welcome, {user.name}</h1>
        <div className="no-store-message">
          <p>You don't have a store assigned to you yet.</p>
          <p>Please contact the system administrator to assign a store to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-owner-dashboard">
      <h1>Welcome, {user.name}</h1>

      <div className="store-info">
        <h2>Your Store</h2>
        <div className="store-details">
          <p><strong>Name:</strong> {storeData.store.name}</p>
          <p><strong>Email:</strong> {storeData.store.email}</p>
          <p><strong>Address:</strong> {storeData.store.address}</p>
          <p>
            <strong>Average Rating:</strong>
            {storeData.averageRating > 0 ? (
              <span className="rating">
                {renderStars(storeData.averageRating)}
                <span className="rating-value">
                  ({parseFloat(storeData.averageRating).toFixed(1)})
                </span>
              </span>
            ) : (
              <span>No ratings yet</span>
            )}
          </p>
        </div>
      </div>

      <div className="raters-container">
        <h2>Users Who Rated Your Store</h2>

        {storeData.raters.length === 0 ? (
          <p>No ratings yet.</p>
        ) : (
          <table className="raters-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {storeData.raters.map(rater => (
                <tr key={rater.id}>
                  <td>{rater.name}</td>
                  <td>
                    <div className="rating">
                      {renderStars(rater.rating)}
                      <span className="rating-value">({rater.rating})</span>
                    </div>
                  </td>
                  <td>{new Date(rater.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
