import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /><p>Loading...</p></div>;

  if (!user || !isAdmin) return (
    <div className="admin-denied">
      <div className="denied-card">
        <span style={{fontSize:'3rem'}}>🔒</span>
        <h2>Admin Access Only</h2>
        <p>You must be logged in as an admin to access this panel.</p>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    </div>
  );

  const nav = [
    { path: '/admin',           label: 'Dashboard',  icon: '📊', exact: true },
    { path: '/admin/products',  label: 'Products',   icon: '🌿' },
    { path: '/admin/inventory', label: 'Inventory',  icon: '📦' },
    { path: '/admin/orders',    label: 'Orders',     icon: '🛒' },
    { path: '/admin/coupons',   label: 'Coupons',    icon: '🎟️' },
    { path: '/admin/notifications', label: 'Notifications', icon: '🔔' },
  ];

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-logo">भूमि</span>
          <span className="admin-label">Admin Panel</span>
        </div>

        <nav className="admin-nav">
          {nav.map(item => (
            <Link key={item.path} to={item.path}
              className={`admin-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item" style={{opacity:0.6}}>
            <span className="nav-icon">🌐</span><span>View Site</span>
          </Link>
          <button className="admin-nav-item signout-btn" onClick={async () => { await signOut(); navigate('/'); }}>
            <span className="nav-icon">🚪</span><span>Sign Out</span>
          </button>
          <div className="admin-user">
            <span className="admin-avatar">👤</span>
            <span className="admin-email">{user.email}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
