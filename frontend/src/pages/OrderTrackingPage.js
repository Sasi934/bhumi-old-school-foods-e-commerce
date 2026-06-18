import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLang } from '../context/LangContext';
import './OrderPages.css';

const STATUSES = [
  { key: 'placed',            en: 'Order Placed',      te: 'ఆర్డర్ నమోదు', icon: '📋' },
  { key: 'confirmed',         en: 'Confirmed',          te: 'నిర్ధారించబడింది', icon: '✅' },
  { key: 'processing',        en: 'Processing',         te: 'ప్రాసెస్ అవుతోంది', icon: '⚙️' },
  { key: 'shipped',           en: 'Shipped',            te: 'పంపబడింది', icon: '📦' },
  { key: 'out_for_delivery',  en: 'Out for Delivery',   te: 'డెలివరీకి బయలుదేరింది', icon: '🚚' },
  { key: 'delivered',         en: 'Delivered',          te: 'డెలివరీ అయింది', icon: '🌿' },
];

const OrderTrackingPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase.from('orders').select('*, order_items(*)')
        .eq('order_number', orderNumber).single();
      setOrder(data);
      if (data) {
        const { data: hist } = await supabase.from('order_status_history')
          .select('*').eq('order_id', data.id).order('created_at');
        setHistory(hist || []);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) return <main className="order-page"><div className="container" style={{padding:'5rem 0', textAlign:'center'}}><p>{t('Loading...','లోడ్ అవుతోంది...')}</p></div></main>;
  if (!order) return <main className="order-page"><div className="container" style={{padding:'5rem 0', textAlign:'center'}}><h2>{t('Order not found','ఆర్డర్ కనుగొనబడలేదు')}</h2></div></main>;

  const currentIdx = STATUSES.findIndex(s => s.key === order.order_status);

  return (
    <main className="order-page">
      <div className="container tracking-wrap">
        <div className="tracking-header">
          <p className="eyebrow" style={{color:'var(--gold)'}}>{t('Order Tracking', 'ఆర్డర్ ట్రాకింగ్')}</p>
          <h1 className="display-md">#{order.order_number}</h1>
          <p style={{color:'var(--sage)', marginTop:'0.5rem', fontSize:'0.875rem'}}>
            {t('Placed on', 'నమోదు తేదీ')} {new Date(order.created_at).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'})}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="tracking-timeline">
          {STATUSES.filter(s => s.key !== 'cancelled' && s.key !== 'returned').map((status, idx) => {
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={status.key} className={`timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="timeline-icon">{status.icon}</div>
                <div className="timeline-line" />
                <p className="timeline-label">{t(status.en, status.te)}</p>
              </div>
            );
          })}
        </div>

        {/* Order Details */}
        <div className="tracking-grid">
          <div className="tracking-card">
            <h3 className="card-heading">{t('Items Ordered', 'ఆర్డర్ చేసిన వస్తువులు')}</h3>
            {order.order_items?.map(item => (
              <div key={item.id} className="tracking-item">
                <span>{item.product_name} <small style={{color:'var(--gold)'}}>×{item.quantity}</small></span>
                <span>₹{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="tracking-total">
              <span>{t('Total', 'మొత్తం')}</span>
              <span>₹{order.total_amount?.toFixed(2)}</span>
            </div>
          </div>

          <div className="tracking-card">
            <h3 className="card-heading">{t('Delivery Address', 'డెలివరీ చిరునామా')}</h3>
            <p><strong>{order.customer_name}</strong></p>
            <p>{order.customer_phone}</p>
            <p>{order.shipping_address?.line1}</p>
            {order.shipping_address?.line2 && <p>{order.shipping_address.line2}</p>}
            <p>{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
          </div>

          <div className="tracking-card">
            <h3 className="card-heading">{t('Payment Info', 'చెల్లింపు వివరాలు')}</h3>
            <div className="tracking-item"><span>{t('Status', 'స్థితి')}</span><span className={`payment-badge ${order.payment_status}`}>{order.payment_status}</span></div>
            {order.razorpay_payment_id && (
              <div className="tracking-item"><span>Payment ID</span><span style={{fontSize:'0.75rem', wordBreak:'break-all'}}>{order.razorpay_payment_id}</span></div>
            )}
            {order.coupon_code && (
              <div className="tracking-item"><span>{t('Coupon', 'కూపన్')}</span><span style={{color:'#27ae60'}}>🎉 {order.coupon_code}</span></div>
            )}
          </div>
        </div>

        <div style={{textAlign:'center', marginTop:'2rem'}}>
          <Link to="/shop" className="btn btn-outline">{t('Continue Shopping', 'షాపింగ్ కొనసాగించండి')}</Link>
        </div>
      </div>
    </main>
  );
};

export default OrderTrackingPage;
