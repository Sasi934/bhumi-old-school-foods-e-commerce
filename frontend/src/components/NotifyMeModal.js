import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './NotifyMeModal.css';

const ADMIN_EMAILS = [
  process.env.REACT_APP_ADMIN_EMAIL,
  process.env.REACT_APP_ADMIN_EMAIL_2,
].filter(Boolean);

const NotifyMeModal = ({ product, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || (!form.email && !form.phone)) {
      setError('Please enter your name and at least email or phone.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Save notify request to database
      const { error: dbError } = await supabase
        .from('notify_requests')
        .insert({
          product_id:     product.id,
          product_name:   product.name,
          customer_name:  form.name,
          customer_email: form.email || null,
          customer_phone: form.phone || null,
        });

      if (dbError) throw dbError;

      // 2. Send email notification to admin via EmailJS or backend
      // We store in DB and admin sees it in panel
      // Optionally call your backend to send email:
      try {
        await fetch('/api/notify/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_name:   product.name,
            customer_name:  form.name,
            customer_email: form.email,
            customer_phone: form.phone,
            admin_emails:   ADMIN_EMAILS,
          }),
        });
      } catch (emailErr) {
        // Email failed but DB saved — not critical
        console.warn('Email notification failed:', emailErr);
      }

      setSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="notify-overlay" onClick={onClose}>
      <div className="notify-modal" onClick={e => e.stopPropagation()}>
        <button className="notify-close" onClick={onClose}>✕</button>

        {success ? (
          <div className="notify-success">
            <div className="success-icon">🌿</div>
            <h3>You're on the list!</h3>
            <p>We'll notify you as soon as <strong>{product.name}</strong> is back in stock.</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="notify-header">
              <span className="notify-badge">Out of Stock</span>
              <h3 className="notify-title">Notify Me When Available</h3>
              <p className="notify-sub">
                <strong>{product.name}</strong> is currently out of stock.
                Enter your details and we'll notify you when it's back!
              </p>
            </div>

            {error && <div className="notify-error">{error}</div>}

            <form onSubmit={handleSubmit} className="notify-form">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <p className="notify-hint">* Enter at least email or phone</p>
              <button
                type="submit"
                className="btn btn-primary notify-submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : '🔔 Notify Me When Available'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default NotifyMeModal;
