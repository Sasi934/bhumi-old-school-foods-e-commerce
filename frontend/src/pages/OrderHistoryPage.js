import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './OrderPages.css';

const STATUS_COLORS = {
  placed:'badge-gold', confirmed:'badge-blue', processing:'badge-blue',
  shipped:'badge-blue', out_for_delivery:'badge-blue', delivered:'badge-green',
  cancelled:'badge-red', returned:'badge-gray'
};

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const { t } = useLang();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('orders').select('*, order_items(*)')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })
        .then(({ data }) => { setOrders(data || []); setLoading(false); });
    } else { setLoading(false); }
  }, [user]);

  const handleEmailSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail) return;
    setLoading(true);
    const { data } = await supabase.from('orders').select('*, order_items(*)')
      .eq('customer_email', searchEmail.trim())
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setSearched(true);
    setLoading(false);
  };

  return (
    <main className="order-page">
      <div className="container" style={{maxWidth:'800px'}}>
        <p className="eyebrow" style={{color:'var(--gold)'}}>{t('Order History', 'ఆర్డర్ చరిత్ర')}</p>
        <h1 className="display-md" style={{margin:'0.5rem 0 2rem'}}>{t('My Orders', 'నా ఆర్డర్లు')}</h1>

        {!user && (
          <div style={{background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'2rem', boxShadow:'var(--shadow-sm)', marginBottom:'2rem'}}>
            <p style={{marginBottom:'1rem', color:'var(--sage)'}}>{t('Enter your email to track orders without logging in:', 'లాగిన్ లేకుండా ఆర్డర్లు ట్రాక్ చేయడానికి మీ ఇమెయిల్ నమోదు చేయండి:')}</p>
            <form onSubmit={handleEmailSearch} style={{display:'flex', gap:'0.75rem'}}>
              <input type="email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                placeholder="your@email.com"
                style={{flex:1, padding:'0.7rem 1rem', border:'1.5px solid var(--cream-dark)', borderRadius:'var(--radius)', fontSize:'0.9rem', outline:'none', color:'var(--forest)', background:'var(--cream)'}} />
              <button type="submit" className="btn btn-primary">{t('Find Orders', 'ఆర్డర్లు కనుగొనండి')}</button>
            </form>
          </div>
        )}

        {loading ? (
          <p style={{color:'var(--sage)', textAlign:'center', padding:'2rem'}}>{t('Loading...', 'లోడ్ అవుతోంది...')}</p>
        ) : orders.length === 0 ? (
          <div style={{textAlign:'center', padding:'4rem 0'}}>
            <p style={{fontSize:'3rem', marginBottom:'1rem'}}>📦</p>
            <p style={{color:'var(--sage)', marginBottom:'1.5rem'}}>
              {searched ? t('No orders found for this email.', 'ఈ ఇమెయిల్‌కు ఆర్డర్లు కనుగొనబడలేదు.') : t('No orders yet.', 'ఇంకా ఆర్డర్లు లేవు.')}
            </p>
            <Link to="/shop" className="btn btn-outline">{t('Start Shopping', 'షాపింగ్ ప్రారంభించండి')}</Link>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            {orders.map(order => (
              <div key={order.id} style={{background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem'}}>
                  <div>
                    <p style={{fontWeight:700, fontSize:'1rem'}}>#{order.order_number}</p>
                    <p style={{fontSize:'0.78rem', color:'var(--sage)', marginTop:'0.2rem'}}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'})}
                    </p>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                    <span className={`badge ${STATUS_COLORS[order.order_status] || 'badge-gray'}`}>
                      {order.order_status?.replace(/_/g,' ')}
                    </span>
                    <strong>₹{order.total_amount?.toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{fontSize:'0.82rem', color:'var(--sage)', marginBottom:'1rem'}}>
                  {order.order_items?.map(item => item.product_name).join(' · ')}
                </div>

                <div style={{display:'flex', gap:'0.75rem'}}>
                  <Link to={`/track/${order.order_number}`} className="btn btn-outline" style={{padding:'0.5rem 1.25rem', fontSize:'0.75rem'}}>
                    {t('Track Order', 'ఆర్డర్ ట్రాక్')}
                  </Link>
                  {order.order_status === 'delivered' && (
                    <span style={{fontSize:'0.75rem', color:'#27ae60', display:'flex', alignItems:'center'}}>✅ {t('Delivered', 'డెలివరీ అయింది')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default OrderHistoryPage;
