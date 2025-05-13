import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import UserDashboard from './pages/user/Dashboard';
import StoreOwnerDashboard from './pages/storeOwner/Dashboard';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />


          <Route element={<Layout />}>

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stores"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStores />
                </ProtectedRoute>
              }
            />


            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />


            <Route
              path="/store-owner/dashboard"
              element={
                <ProtectedRoute allowedRoles={['store_owner']}>
                  <StoreOwnerDashboard />
                </ProtectedRoute>
              }
            />


            <Route
              path="/change-password"
              element={
                <ProtectedRoute allowedRoles={['admin', 'user', 'store_owner']}>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
          </Route>


          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
