import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import './Admin.css';

const emptyCoupon = { code: '', description: '', type: 'percent', value: '', min_order_amount: '', max_discount_amount: '', usage_limit: '', valid_until: '', is_active: true };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openAdd = () => { setForm(emptyCoupon); setEditId(null); setModal('add'); };
  const openEdit = (c) => {
    setForm({
      ...c,
      valid_until: c.valid_until ? c.valid_until.slice(0, 16) : '',
      value: c.value || '',
      min_order_amount: c.min_order_amount || '',
      max_discount_amount: c.max_discount_amount || '',
      usage_limit: c.usage_limit || '',
    });
    setEditId(c.id);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.code || !form.value) return alert('Code and value are required');
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description,
      type: form.type,
      value: parseFloat(form.value),
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      valid_until: form.valid_until || null,
      is_active: form.is_active,
    };
    if (editId) {
      await supabase.from('coupons').update(payload).eq('id', editId);
    } else {
      await supabase.from('coupons').insert(payload);
    }
    setSaving(false);
    setModal(null);
    fetchCoupons();
  };

  const handleDelete = async (id) => {
    await supabase.from('coupons').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchCoupons();
  };

  const toggleActive = async (id, current) => {
    await supabase.from('coupons').update({ is_active: !current }).eq('id', id);
    fetchCoupons();
  };

  const getDiscountDisplay = (c) => {
    if (c.type === 'percent') return `${c.value}% off`;
    if (c.type === 'flat') return `₹${c.value} off`;
    if (c.type === 'free_shipping') return 'Free Shipping';
    return c.value;
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-sub">{coupons.length} coupon codes</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Create Coupon</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Code</th><th>Type</th><th>Discount</th><th>Min Order</th><th>Used / Limit</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong style={{letterSpacing:'0.08em', fontFamily:'monospace', fontSize:'0.95rem'}}>{c.code}</strong>
                    {c.description && <p style={{fontSize:'0.72rem', color:'var(--sage)', marginTop:'0.15rem'}}>{c.description}</p>}
                  </td>
                  <td><span className="badge badge-gold">{c.type}</span></td>
                  <td><strong>{getDiscountDisplay(c)}</strong>
                    {c.max_discount_amount && <p style={{fontSize:'0.72rem', color:'var(--sage)'}}>Max ₹{c.max_discount_amount}</p>}
                  </td>
                  <td>{c.min_order_amount > 0 ? `₹${c.min_order_amount}` : '—'}</td>
                  <td>
                    <span style={{fontWeight:600}}>{c.used_count}</span>
                    <span style={{color:'var(--sage)'}}> / {c.usage_limit || '∞'}</span>
                  </td>
                  <td style={{fontSize:'0.78rem', color:'var(--sage)'}}>
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(c.id, c.is_active)}
                      className={`badge ${c.is_active ? 'badge-green' : 'badge-red'}`}
                      style={{cursor:'pointer', border:'none', font:'inherit'}}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" onClick={() => openEdit(c)}>✏️ Edit</button>
                      <button className="action-btn danger" onClick={() => setDeleteConfirm(c.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && coupons.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center', color:'var(--sage)', padding:'2rem'}}>No coupons yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginTop:'1.5rem'}}>
        {[
          { icon:'💯', label:'Percent Discount', desc:'e.g. BHUMI10 gives 10% off. Set max discount cap if needed.' },
          { icon:'💰', label:'Flat Amount Off', desc:'e.g. SAVE50 gives flat ₹50 off on minimum order.' },
          { icon:'🚚', label:'Free Shipping', desc:'Waives shipping charges regardless of order value.' },
        ].map(card => (
          <div key={card.label} className="admin-card" style={{borderLeft:'3px solid var(--gold)'}}>
            <p style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>{card.icon}</p>
            <p style={{fontWeight:600, marginBottom:'0.25rem'}}>{card.label}</p>
            <p style={{fontSize:'0.78rem', color:'var(--sage)'}}>{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'add' ? '+ Create Coupon' : '✏️ Edit Coupon'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. BHUMI20" style={{letterSpacing:'0.1em', fontWeight:600}} />
                </div>
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="percent">Percent (% off)</option>
                    <option value="flat">Flat Amount (₹ off)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="e.g. Welcome offer — 10% off your first order" />
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem'}}>
                <div className="form-group">
                  <label>{form.type === 'percent' ? 'Discount %' : 'Flat Amount (₹)'} *</label>
                  <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})}
                    placeholder={form.type === 'percent' ? '10' : '50'} />
                </div>
                <div className="form-group">
                  <label>Min Order Amount (₹)</label>
                  <input type="number" value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: e.target.value})} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Max Discount Cap (₹)</label>
                  <input type="number" value={form.max_discount_amount} onChange={e => setForm({...form, max_discount_amount: e.target.value})} placeholder="Optional" />
                </div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input type="number" value={form.usage_limit} onChange={e => setForm({...form, usage_limit: e.target.value})} placeholder="Leave blank for unlimited" />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input type="datetime-local" value={form.valid_until} onChange={e => setForm({...form, valid_until: e.target.value})} />
                </div>
              </div>

              <label style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem', cursor:'pointer'}}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                Coupon is Active
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : modal === 'add' ? 'Create Coupon' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{maxWidth:380}} onClick={e => e.stopPropagation()}>
            <h3 style={{marginBottom:'1rem'}}>🗑️ Delete Coupon?</h3>
            <p style={{color:'var(--sage)', marginBottom:'1.5rem'}}>This coupon will be permanently deleted.</p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" style={{background:'#c0392b', borderColor:'#c0392b'}} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
