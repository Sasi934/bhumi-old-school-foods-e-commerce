import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import './Admin.css';

const CATEGORY_IMAGES = {
  'flours-mixes': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&q=80',
  'millets': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&q=80',
  'rice-pulses': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=100&q=80',
  'spices-powders': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&q=80',
  'natural-care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&q=80',
  'cold-pressed-oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&q=80',
  'pickles': 'https://images.unsplash.com/photo-1589135716383-9f98e8a2e6e4?w=100&q=80',
  'sweeteners-snacks': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=80',
};

const emptyProduct = { name: '', name_telugu: '', description: '', description_telugu: '', category_id: '', price: '', original_price: '', unit: '500g', stock_quantity: 100, is_available: true, is_featured: false, tags: '' };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyProduct);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = useCallback(async () => {
    let query = supabase.from('products').select('*, categories(name, slug)').order('name');
    if (catFilter) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', catFilter).single();
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (search) query = query.ilike('name', `%${search}%`);
    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }, [search, catFilter]);

  useEffect(() => {
    supabase.from('categories').select('*').order('display_order').then(({ data }) => setCategories(data || []));
    fetchProducts();
  }, [fetchProducts]);

  const openAdd = () => { setForm(emptyProduct); setEditId(null); setImageFile(null); setImagePreview(''); setModal('add'); };
  const openEdit = (p) => {
    setForm({ ...p, tags: (p.tags || []).join(', '), price: p.price || '', original_price: p.original_price || '' });
    setEditId(p.id);
    setImagePreview(p.image_url || '');
    setImageFile(null);
    setModal('edit');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (productSlug) => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `products/${productSlug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, imageFile, { upsert: true });
    if (error) { console.error('Upload error:', error); return null; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    return publicUrl;
  };

  const handleSave = async () => {
    if (!form.name || !form.category_id) return alert('Name and category are required');
    setSaving(true);

    const slug = editId ? form.slug : form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const imageUrl = await uploadImage(slug);

    const payload = {
      name: form.name,
      name_telugu: form.name_telugu,
      slug,
      description: form.description,
      description_telugu: form.description_telugu,
      category_id: form.category_id,
      price: parseFloat(form.price) || 0,
      original_price: parseFloat(form.original_price) || 0,
      unit: form.unit,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      is_available: form.is_available,
      is_featured: form.is_featured,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      ...(imageUrl && { image_url: imageUrl }),
    };

    if (editId) {
      await supabase.from('products').update(payload).eq('id', editId);
    } else {
      await supabase.from('products').insert(payload);
    }

    setSaving(false);
    setModal(null);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await supabase.from('products').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchProducts();
  };

  const toggleAvailable = async (id, current) => {
    await supabase.from('products').update({ is_available: !current }).eq('id', id);
    fetchProducts();
  };
  const toggleOutOfStock = async (id, currentStatus) => {
  await supabase.from('products').update({ out_of_stock: !currentStatus }).eq('id', id);
  fetchProducts();
};

  const getImage = (p) => p.image_url || CATEGORY_IMAGES[p.categories?.slug] || '';

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub">{products.length} products in catalog</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <input className="admin-search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="admin-filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>MRP</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                      <img src={getImage(p)} alt={p.name} className="admin-product-img" onError={e => e.target.style.display='none'} />
                      <div>
                        <p style={{fontWeight:600, fontSize:'0.875rem'}}>{p.name}</p>
                        {p.name_telugu && <p style={{fontSize:'0.75rem', color:'var(--sage)'}}>{p.name_telugu}</p>}
                        {p.is_featured && <span className="badge badge-gold" style={{marginTop:'0.2rem'}}>Featured</span>}
                        {p.out_of_stock && (
  <span className="badge badge-red" style={{marginTop:'0.25rem', display:'block', width:'fit-content'}}>
    Out of Stock
  </span>
)}
                      </div>
                    </div>
                  </td>
                  <td style={{fontSize:'0.8rem', color:'var(--sage)'}}>{p.categories?.name}</td>
                  <td><strong>₹{p.price?.toFixed(2)}</strong></td>
                  <td style={{color:'var(--sage)', textDecoration:'line-through', fontSize:'0.85rem'}}>₹{p.original_price?.toFixed(2)}</td>
                  <td>{p.stock_quantity}</td>
                  <td>
                    <button onClick={() => toggleAvailable(p.id, p.is_available)}
                      className={`badge ${p.is_available ? 'badge-green' : 'badge-red'}`}
                      style={{cursor:'pointer', border:'none', font:'inherit'}}>
                      {p.is_available ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
  <button className="action-btn" onClick={() => openEdit(p)}>
    ✏️ Edit
  </button>
  <button
    onClick={() => toggleOutOfStock(p.id, p.out_of_stock)}
    style={{
      padding: '0.35rem 0.7rem',
      borderRadius: '4px',
      border: '1px solid',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.72rem',
      whiteSpace: 'nowrap',
      background: p.out_of_stock ? 'rgba(39,174,96,0.08)' : 'rgba(192,57,43,0.08)',
      color: p.out_of_stock ? '#27ae60' : '#c0392b',
      borderColor: p.out_of_stock ? 'rgba(39,174,96,0.2)' : 'rgba(192,57,43,0.2)',
    }}
  >
    {p.out_of_stock ? '✅ In Stock' : '🚫 Out of Stock'}
  </button>
</div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center', color:'var(--sage)', padding:'2rem'}}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'add' ? '+ Add Product' : '✏️ Edit Product'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              {/* Image Upload */}
              <div>
                <label style={{fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--sage)', display:'block', marginBottom:'0.5rem'}}>
                  Product Image
                </label>
                <div className="image-upload-area" onClick={() => document.getElementById('img-upload').click()}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" />
                    : <div><p style={{fontSize:'2rem'}}>📷</p><p style={{fontSize:'0.85rem', color:'var(--sage)', marginTop:'0.5rem'}}>Click to upload image</p></div>
                  }
                  <p style={{fontSize:'0.75rem', color:'var(--sage)', marginTop:'0.5rem'}}>Replaces existing image</p>
                </div>
                <input id="img-upload" type="file" accept="image/*" style={{display:'none'}} onChange={handleImageChange} />
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                <div className="form-group"><label>Product Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Sprouted Ragi Flour" /></div>
                <div className="form-group"><label>Telugu Name</label><input value={form.name_telugu} onChange={e => setForm({...form, name_telugu: e.target.value})} placeholder="తెలుగు పేరు" /></div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem'}}>
                <div className="form-group"><label>Selling Price (₹)</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" /></div>
                <div className="form-group"><label>MRP / Original (₹)</label><input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} placeholder="0.00" /></div>
                <div className="form-group"><label>Unit</label><input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="500g, 1L, 250ml" /></div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                <div className="form-group"><label>Stock Quantity</label><input type="number" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} /></div>
                <div className="form-group"><label>Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="organic, gluten-free, sprouted" /></div>
              </div>

              <div className="form-group"><label>Description (English)</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
              <div className="form-group"><label>Description (Telugu)</label><textarea value={form.description_telugu} onChange={e => setForm({...form, description_telugu: e.target.value})} rows={2} /></div>

              <div style={{display:'flex', gap:'1.5rem'}}>
                <label style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem', cursor:'pointer'}}>
                  <input type="checkbox" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} />
                  Available / Active
                </label>
                <label style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem', cursor:'pointer'}}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} />
                  Featured Product
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" style={{maxWidth:380}} onClick={e => e.stopPropagation()}>
            <h3 style={{marginBottom:'1rem'}}>🗑️ Delete Product?</h3>
            <p style={{color:'var(--sage)', marginBottom:'1.5rem'}}>This action cannot be undone. The product will be permanently removed.</p>
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

export default AdminProducts;
