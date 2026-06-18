import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import './Admin.css';

const STATUSES = ['placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned'];
const STATUS_COLORS = {
  placed:'badge-gold', confirmed:'badge-blue', processing:'badge-blue',
  shipped:'badge-blue', out_for_delivery:'badge-blue', delivered:'badge-green',
  cancelled:'badge-red', returned:'badge-gray'
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (statusFilter) query = query.eq('order_status', statusFilter);
    if (search) query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openOrder = async (order) => {
    setSelectedOrder(order);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setOrderItems(data || []);
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    await supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId);
    await supabase.from('order_status_history').insert({ order_id: orderId, status: newStatus, note: `Status updated to ${newStatus} by admin` });
    setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
    fetchOrders();
    setUpdating(false);
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    await supabase.from('orders').update({ payment_status: newStatus }).eq('id', orderId);
    setSelectedOrder(prev => ({ ...prev, payment_status: newStatus }));
    fetchOrders();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-sub">{orders.length} orders</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <input className="admin-search" placeholder="Search by order #, name, email..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong style={{fontSize:'0.8rem'}}>{order.order_number}</strong></td>
                  <td>
                    <p style={{fontWeight:500, fontSize:'0.875rem'}}>{order.customer_name}</p>
                    <p style={{fontSize:'0.72rem', color:'var(--sage)'}}>{order.customer_phone}</p>
                  </td>
                  <td style={{fontSize:'0.8rem', color:'var(--sage)'}}>{order.customer_email}</td>
                  <td><strong>₹{order.total_amount?.toFixed(2)}</strong>
                    {order.discount_amount > 0 && <p style={{fontSize:'0.72rem', color:'#27ae60'}}>−₹{order.discount_amount?.toFixed(2)}</p>}
                  </td>
                  <td><span className={`badge ${order.payment_status === 'paid' ? 'badge-green' : order.payment_status === 'failed' ? 'badge-red' : 'badge-gold'}`}>{order.payment_status}</span></td>
                  <td><span className={`badge ${STATUS_COLORS[order.order_status] || 'badge-gray'}`}>{order.order_status?.replace(/_/g,' ')}</span></td>
                  <td style={{fontSize:'0.78rem', color:'var(--sage)'}}>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  <td><button className="action-btn primary" onClick={() => openOrder(order)}>View</button></td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center', color:'var(--sage)', padding:'2rem'}}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box" style={{maxWidth:680}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Order #{selectedOrder.order_number}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            {/* Customer */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem'}}>
              <div style={{background:'var(--cream)', borderRadius:'var(--radius)', padding:'1rem'}}>
                <p style={{fontSize:'0.65rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.5rem'}}>Customer</p>
                <p style={{fontWeight:600}}>{selectedOrder.customer_name}</p>
                <p style={{fontSize:'0.82rem', color:'var(--sage)'}}>{selectedOrder.customer_email}</p>
                <p style={{fontSize:'0.82rem', color:'var(--sage)'}}>{selectedOrder.customer_phone}</p>
              </div>
              <div style={{background:'var(--cream)', borderRadius:'var(--radius)', padding:'1rem'}}>
                <p style={{fontSize:'0.65rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.5rem'}}>Delivery Address</p>
                <p style={{fontSize:'0.82rem', lineHeight:1.7, color:'var(--sage)'}}>
                  {selectedOrder.shipping_address?.line1}{selectedOrder.shipping_address?.line2 ? ', ' + selectedOrder.shipping_address.line2 : ''}<br />
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                </p>
              </div>
            </div>

            {/* Items */}
            <table className="admin-table" style={{marginBottom:'1rem'}}>
              <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
              <tbody>
                {orderItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>₹{item.product_price?.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.subtotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{background:'var(--cream)', borderRadius:'var(--radius)', padding:'1rem', marginBottom:'1.25rem', fontSize:'0.875rem'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.35rem'}}><span>Subtotal</span><span>₹{selectedOrder.subtotal?.toFixed(2)}</span></div>
              {selectedOrder.discount_amount > 0 && <div style={{display:'flex', justifyContent:'space-between', color:'#27ae60', marginBottom:'0.35rem'}}><span>Discount ({selectedOrder.coupon_code})</span><span>−₹{selectedOrder.discount_amount?.toFixed(2)}</span></div>}
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.35rem'}}><span>Shipping</span><span>{selectedOrder.shipping_charge === 0 ? 'Free' : `₹${selectedOrder.shipping_charge}`}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', fontWeight:700, borderTop:'1px solid var(--cream-dark)', paddingTop:'0.5rem'}}><span>Total</span><span>₹{selectedOrder.total_amount?.toFixed(2)}</span></div>
            </div>

            {/* Update Status */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
              <div className="form-group">
                <label>Order Status</label>
                <select value={selectedOrder.order_status} onChange={e => updateStatus(selectedOrder.id, e.target.value)} disabled={updating}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Payment Status</label>
                <select value={selectedOrder.payment_status} onChange={e => updatePaymentStatus(selectedOrder.id, e.target.value)}>
                  {['pending','paid','failed','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {selectedOrder.razorpay_payment_id && (
              <p style={{fontSize:'0.72rem', color:'var(--sage)', marginTop:'0.75rem'}}>
                Razorpay Payment ID: <strong>{selectedOrder.razorpay_payment_id}</strong>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
