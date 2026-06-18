import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import '../admin/Admin.css';

const AdminNotifications = () => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all'); // all | pending | notified
  const [stats, setStats]         = useState({ total: 0, pending: 0, notified: 0 });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('notify_requests')
      .select('*, products(name, image_url, out_of_stock)')
      .order('created_at', { ascending: false });

    if (filter === 'pending')   query = query.eq('is_notified', false);
    if (filter === 'notified')  query = query.eq('is_notified', true);
    if (search) query = query.or(`customer_name.ilike.%${search}%,product_name.ilike.%${search}%,customer_email.ilike.%${search}%`);

    const { data } = await query;
    setRequests(data || []);

    // Stats
    const { count: total }    = await supabase.from('notify_requests').select('*', { count: 'exact', head: true });
    const { count: pending }  = await supabase.from('notify_requests').select('*', { count: 'exact', head: true }).eq('is_notified', false);
    const { count: notified } = await supabase.from('notify_requests').select('*', { count: 'exact', head: true }).eq('is_notified', true);
    setStats({ total: total||0, pending: pending||0, notified: notified||0 });
    setLoading(false);
  }, [search, filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const markNotified = async (id) => {
    await supabase.from('notify_requests').update({ is_notified: true }).eq('id', id);
    fetchRequests();
  };

  const markAllNotified = async (productName) => {
    await supabase.from('notify_requests')
      .update({ is_notified: true })
      .eq('product_name', productName)
      .eq('is_notified', false);
    fetchRequests();
  };

  const deleteRequest = async (id) => {
    await supabase.from('notify_requests').delete().eq('id', id);
    fetchRequests();
  };

  // Group by product
  const grouped = requests.reduce((acc, req) => {
    if (!acc[req.product_name]) acc[req.product_name] = [];
    acc[req.product_name].push(req);
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🔔 Notifications</h1>
          <p className="admin-page-sub">Customers waiting for out-of-stock products</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Requests', value: stats.total,    icon: '🔔', color: 'var(--gold)' },
          { label: 'Pending',        value: stats.pending,  icon: '⏳', color: '#c0392b' },
          { label: 'Notified',       value: stats.notified, icon: '✅', color: '#27ae60' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeftColor: s.color }}>
            <p className="stat-label">{s.icon} {s.label}</p>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="Search by product, customer, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="admin-filter-select"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending Only</option>
            <option value="notified">Already Notified</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sage)' }}>
            Loading...
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sage)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎉</p>
            <p>No notification requests yet!</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              When customers click "Notify Me" on out-of-stock products, they'll appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(grouped).map(([productName, reqs]) => (
              <div key={productName} style={{
                border: '1px solid var(--cream-dark)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden'
              }}>
                {/* Product Header */}
                <div style={{
                  background: 'var(--cream)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--cream-dark)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📦</span>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--forest)', fontSize: '0.95rem' }}>
                        {productName}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--sage)' }}>
                        {reqs.length} customer{reqs.length > 1 ? 's' : ''} waiting
                        {reqs[0]?.products?.out_of_stock && (
                          <span style={{
                            marginLeft: '0.5rem',
                            background: 'rgba(192,57,43,0.1)',
                            color: '#c0392b',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '100px',
                            fontSize: '0.65rem',
                            fontWeight: 700
                          }}>
                            OUT OF STOCK
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {reqs.some(r => !r.is_notified) && (
                      <button
                        className="action-btn primary"
                        onClick={() => markAllNotified(productName)}
                        style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                      >
                        ✅ Mark All Notified
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer List */}
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Requested On</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reqs.map(req => (
                        <tr key={req.id}>
                          <td style={{ fontWeight: 600 }}>{req.customer_name}</td>
                          <td>
                            {req.customer_email ? (
                              <a href={`mailto:${req.customer_email}`}
                                style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '0.85rem' }}>
                                {req.customer_email}
                              </a>
                            ) : '—'}
                          </td>
                          <td>
                            {req.customer_phone ? (
                              <a href={`tel:${req.customer_phone}`}
                                style={{ color: 'var(--forest)', fontSize: '0.85rem' }}>
                                {req.customer_phone}
                              </a>
                            ) : '—'}
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--sage)' }}>
                            {new Date(req.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td>
                            <span className={`badge ${req.is_notified ? 'badge-green' : 'badge-gold'}`}>
                              {req.is_notified ? 'Notified' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns">
                              {!req.is_notified && (
                                <button
                                  className="action-btn primary"
                                  onClick={() => markNotified(req.id)}
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  ✅ Mark Notified
                                </button>
                              )}
                              <button
                                className="action-btn danger"
                                onClick={() => deleteRequest(req.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
