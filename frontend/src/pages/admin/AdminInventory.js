import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import './Admin.css';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('id, name, unit, stock_quantity, is_available, price, categories(name)')
      .order('name');
    if (search) query = query.ilike('name', `%${search}%`);
    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateStock = async (id, newQty) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    await supabase.from('products').update({ stock_quantity: parseInt(newQty) || 0 }).eq('id', id);
    setSaving(prev => ({ ...prev, [id]: false }));
  };

  const updatePrice = async (id, newPrice) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    await supabase.from('products').update({ price: parseFloat(newPrice) || 0 }).eq('id', id);
    setSaving(prev => ({ ...prev, [id]: false }));
  };

  const getStockBadge = (qty) => {
    if (qty <= 0) return <span className="badge badge-red">Out of Stock</span>;
    if (qty < 10) return <span className="badge badge-gold">Low Stock</span>;
    return <span className="badge badge-green">In Stock</span>;
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventory</h1>
          <p className="admin-page-sub">Update stock quantities and prices quickly</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--sage)' }}>
            {products.length} products
          </span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Selling Price (₹)</th>
                <th>Stock Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--sage)' }}>{p.categories?.name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--sage)' }}>{p.unit}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--sage)', fontSize: '0.85rem' }}>₹</span>
                      <input
                        type="number"
                        defaultValue={p.price}
                        onBlur={e => updatePrice(p.id, e.target.value)}
                        style={{
                          width: '90px', padding: '0.35rem 0.5rem',
                          border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)',
                          fontSize: '0.875rem', fontWeight: 600, color: 'var(--forest)',
                          background: 'var(--cream)', outline: 'none'
                        }}
                      />
                      {saving[p.id] && <span style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>saving...</span>}
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      defaultValue={p.stock_quantity}
                      onBlur={e => updateStock(p.id, e.target.value)}
                      style={{
                        width: '80px', padding: '0.35rem 0.5rem',
                        border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)',
                        fontSize: '0.875rem', color: 'var(--forest)',
                        background: 'var(--cream)', outline: 'none'
                      }}
                    />
                  </td>
                  <td>{getStockBadge(p.stock_quantity)}</td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--sage)', padding: '2rem' }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
