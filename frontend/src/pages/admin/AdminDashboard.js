import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: orderCount },
        { data: revenue },
        { count: productCount },
        { count: customerCount },
        { data: recent }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('customer_email', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(8)
      ]);
      const totalRevenue = revenue?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      setStats({ orders: orderCount || 0, revenue: totalRevenue, products: productCount || 0, customers: customerCount || 0 });
      setRecentOrders(recent || []);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const STATUS_COLORS = {
    placed: 'badge-gold', confirmed: 'badge-blue', processing: 'badge-blue',
    shipped: 'badge-blue', out_for_delivery: 'badge-blue', delivered: 'badge-green',
    cancelled: 'badge-red', returned: 'badge-gray'
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-sub">Welcome back, Admin 🌿</p>
        </div>
        <Link to="/admin/products" className="btn btn-primary">+ Add Product</Link>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Total Orders', value: stats.orders, sub: 'All time', icon: '📦' },
          { label: 'Revenue', value: `₹${stats.revenue.toFixed(0)}`, sub: 'Paid orders', icon: '💰' },
          { label: 'Products', value: stats.products, sub: 'In catalog', icon: '🌿' },
          { label: 'Customers', value: stats.customers, sub: 'Unique emails', icon: '👥' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.icon} {s.label}</p>
            <p className="stat-value">{loading ? '...' : s.value}</p>
            <p className="stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem'}}>
        {[
          { to:'/admin/products', icon:'🌿', label:'Manage Products', sub:'Add, edit, remove products' },
          { to:'/admin/orders', icon:'📦', label:'Manage Orders', sub:'View & update order status' },
          { to:'/admin/coupons', icon:'🎟️', label:'Manage Coupons', sub:'Create discount codes' },
        ].map(q => (
          <Link key={q.to} to={q.to} className="admin-card" style={{display:'block', textDecoration:'none', transition:'var(--transition)'}}>
            <div style={{fontSize:'2rem', marginBottom:'0.75rem'}}>{q.icon}</div>
            <p style={{fontWeight:600, color:'var(--forest)', marginBottom:'0.25rem'}}>{q.label}</p>
            <p style={{fontSize:'0.8rem', color:'var(--sage)'}}>{q.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem'}}>
          <h2 style={{fontSize:'1rem', fontWeight:600}}>Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn-ghost" style={{fontSize:'0.75rem'}}>View All →</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.order_number}</strong></td>
                  <td>
                    <p style={{fontWeight:500}}>{order.customer_name}</p>
                    <p style={{fontSize:'0.75rem', color:'var(--sage)'}}>{order.customer_email}</p>
                  </td>
                  <td>₹{order.total_amount?.toFixed(2)}</td>
                  <td><span className={`badge ${STATUS_COLORS[order.order_status] || 'badge-gray'}`}>{order.order_status}</span></td>
                  <td style={{fontSize:'0.8rem', color:'var(--sage)'}}>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && !loading && (
                <tr><td colSpan={5} style={{textAlign:'center', color:'var(--sage)', padding:'2rem'}}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
