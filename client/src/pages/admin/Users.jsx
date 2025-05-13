import { useState, useEffect } from 'react';
import axios from 'axios';
import { validateForm } from '../../utils/validation';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`http://localhost:5000/api/users?${queryParams}`);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);


  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };


  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };


  const clearFilters = () => {
    setFilters({
      name: '',
      email: '',
      address: '',
      role: ''
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const validationErrors = validateForm(formData, [
      'name',
      'email',
      'address',
      'password',
      'role'
    ]);

    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsSubmitting(true);

        await axios.post('http://localhost:5000/api/users', formData);

        setFormData({
          name: '',
          email: '',
          address: '',
          password: '',
          role: 'user'
        });

        setShowAddForm(false);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to add user');
      } finally {
        setIsSubmitting(false);
      }
    }
  };



  if (loading && users.length === 0) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="admin-users">
      <h1>Manage Users</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <button
          className="add-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h2>Add New User</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
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
              <textarea
                id="address"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
              {formErrors.address && <div className="error-text">{formErrors.address}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              {formErrors.password && <div className="error-text">{formErrors.password}</div>}
              <small className="form-text text-muted">
                Password must be 8-16 characters, include at least one uppercase letter and one special character.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Normal User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
              {formErrors.role && <div className="error-text">{formErrors.role}</div>}
            </div>

            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Adding...' : 'Add User'}
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

          <div className="filter-group">
            <label htmlFor="role-filter">Role</label>
            <select
              id="role-filter"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">Normal User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          <button onClick={clearFilters} className="clear-filters">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
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
              <th onClick={() => requestSort('role')}>
                Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('average_rating')}>
                Rating {sortConfig.key === 'average_rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No users found</td>
              </tr>
            ) : (
              sortedUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td>
                    {user.role === 'admin' && 'Administrator'}
                    {user.role === 'user' && 'Normal User'}
                    {user.role === 'store_owner' && 'Store Owner'}
                  </td>
                  <td>
                    {user.role === 'store_owner' && user.average_rating
                      ? (typeof user.average_rating === 'number'
                        ? user.average_rating.toFixed(1)
                        : user.average_rating)
                      : user.role === 'store_owner'
                        ? 'No ratings yet'
                        : 'N/A'}
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

export default AdminUsers;
