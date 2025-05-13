import { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <Link to="/">Store Rating App</Link>
        </div>
        <nav className="nav">
          {user && (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard">Dashboard</Link>
                  <Link to="/admin/users">Users</Link>
                  <Link to="/admin/stores">Stores</Link>
                </>
              )}
              {user.role === 'user' && (
                <Link to="/user/dashboard">Dashboard</Link>
              )}
              {user.role === 'store_owner' && (
                <Link to="/store-owner/dashboard">Dashboard</Link>
              )}
              <Link to="/change-password">Change Password</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          )}
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Store Rating App</p>
      </footer>
    </div>
  );
};

export default Layout;
