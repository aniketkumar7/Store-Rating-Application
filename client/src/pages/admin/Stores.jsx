import { useState, useEffect } from 'react';
import axios from 'axios';
import { validateEmail, validateAddress } from '../../utils/validation';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch stores and store owners
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Build query string from filters
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        // Fetch stores
        const storesResponse = await axios.get(`http://localhost:5000/api/stores?${queryParams}`);
        setStores(storesResponse.data);

        // Fetch store owners (users with role 'store_owner')
        const usersResponse = await axios.get('http://localhost:5000/api/users?role=store_owner');
        setStoreOwners(usersResponse.data);
      } catch (err) {
        setError('Failed to load data');
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      email: '',
      address: ''
    });
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Store name is required';
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const addressError = validateAddress(formData.address);
    if (addressError) {
      newErrors.address = addressError;
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setIsSubmitting(true);

        const dataToSubmit = {
          ...formData,
          owner_id: formData.owner_id ? Number(formData.owner_id) : null
        };

        await axios.post('http://localhost:5000/api/stores', dataToSubmit);

        setFormData({
          name: '',
          email: '',
          address: '',
          owner_id: ''
        });

        setShowAddForm(false);

        const response = await axios.get('http://localhost:5000/api/stores');
        setStores(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to add store');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading && stores.length === 0) {
    return <div className="loading">Loading stores...</div>;
  }

  return (
    <div className="admin-stores">
      <h1>Manage Stores</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <button
          className="add-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Store'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h2>Add New Store</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Store Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {formErrors.name && <div className="error-text">{formErrors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && <div className="error-text">{formErrors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              ></input>
              {formErrors.address && <div className="error-text">{formErrors.address}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="owner_id">Store Owner</label>
              <select
                id="owner_id"
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
              >
                <option value="">-- Select Store Owner (Optional) --</option>
                {storeOwners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Adding...' : 'Add Store'}
            </button>
          </form>
        </div>
      )}

      <div className="filters">
        <h3>Filters</h3>
        <div className="filter-form">
          <div className="filter-group">
            <label htmlFor="name-filter">Name</label>
            <input
              type="text"
              id="name-filter"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="email-filter">Email</label>
            <input
              type="text"
              id="email-filter"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
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
            />
          </div>

          <button onClick={clearFilters} className="clear-filters">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="stores-table-container">
        <table className="stores-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')}>
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('email')}>
                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('address')}>
                Address {sortConfig.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('average_rating')}>
                Rating {sortConfig.key === 'average_rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
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
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td>
                    {store.average_rating
                      ? parseFloat(store.average_rating).toFixed(1)
                      : 'No ratings yet'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStores;
