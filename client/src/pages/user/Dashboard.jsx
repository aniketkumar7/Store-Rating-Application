import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { validateRating } from '../../utils/validation';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    address: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [ratingInProgress, setRatingInProgress] = useState(null);

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        
        const response = await axios.get(`http://localhost:5000/api/stores?${queryParams}`);
        setStores(response.data);
      } catch (err) {
        setError('Failed to load stores');
        console.error('Stores fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [filters]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort stores based on sortConfig
  const sortedStores = [...stores].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      name: '',
      address: ''
    });
  };

  // Submit rating
  const submitRating = async (storeId, rating) => {
    // Validate rating
    const ratingError = validateRating(rating);
    if (ratingError) {
      setError(ratingError);
      return;
    }
    
    try {
      setRatingInProgress(storeId);
      setError(null);
      
      await axios.post('http://localhost:5000/api/ratings', {
        store_id: storeId,
        rating
      });
      
      // Update the store in the local state
      setStores(prevStores => 
        prevStores.map(store => 
          store.id === storeId 
            ? { ...store, user_rating: rating } 
            : store
        )
      );
      
      // Refresh the stores to get updated average rating
      const response = await axios.get('http://localhost:5000/api/stores');
      setStores(response.data);
    } catch (err) {
      setError('Failed to submit rating');
      console.error('Rating submission error:', err);
    } finally {
      setRatingInProgress(null);
    }
  };

  // Render star rating
  const renderStars = (rating, storeId, interactive = false) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <span 
            key={i} 
            onClick={() => submitRating(storeId, i)}
            className={`star interactive ${i <= rating ? 'filled' : 'empty'}`}
          >
            {i <= rating ? <FaStar /> : <FaRegStar />}
          </span>
        );
      } else {
        stars.push(
          <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
            {i <= rating ? <FaStar /> : <FaRegStar />}
          </span>
        );
      }
    }
    
    return stars;
  };

  if (loading && stores.length === 0) {
    return <div className="loading">Loading stores...</div>;
  }

  return (
    <div className="user-dashboard">
      <h1>Welcome, {user.name}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters">
        <h3>Find Stores</h3>
        <div className="filter-form">
          <div className="filter-group">
            <label htmlFor="name-filter">Store Name</label>
            <input
              type="text"
              id="name-filter"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search by name"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="address-filter">Address</label>
            <input
              type="text"
              id="address-filter"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              placeholder="Search by address"
            />
          </div>
          
          <button onClick={clearFilters} className="clear-filters">
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="stores-container">
        <h2>Stores</h2>
        
        <div className="stores-table-container">
          <table className="stores-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('name')}>
                  Store Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('address')}>
                  Address {sortConfig.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('average_rating')}>
                  Overall Rating {sortConfig.key === 'average_rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Your Rating</th>
              </tr>
            </thead>
            <tbody>
              {sortedStores.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">No stores found</td>
                </tr>
              ) : (
                sortedStores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address}</td>
                    <td>
                      {store.average_rating 
                        ? (
                          <div className="rating">
                            {renderStars(Math.round(store.average_rating))}
                            <span className="rating-value">
                              ({parseFloat(store.average_rating).toFixed(1)})
                            </span>
                          </div>
                        ) 
                        : 'No ratings yet'}
                    </td>
                    <td>
                      {ratingInProgress === store.id ? (
                        <div className="rating-loading">Submitting...</div>
                      ) : (
                        <div className="rating interactive">
                          {renderStars(store.user_rating || 0, store.id, true)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;