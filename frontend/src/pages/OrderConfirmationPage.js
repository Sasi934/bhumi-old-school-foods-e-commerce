import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLang } from '../context/LangContext';
import './OrderPages.css';

export const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const { t } = useLang();

  useEffect(() => {
    supabase.from('orders').select('*, order_items(*)').eq('order_number', orderNumber).single()
      .then(({ data }) => setOrder(data));
  }, [orderNumber]);

  return (
    <main className="order-page">
      <div className="container order-confirm-wrap">
        <div className="confirm-icon">🌿</div>
        <p className="eyebrow" style={{color:'var(--gold)', textAlign:'center'}}>{t('Order Placed Successfully', 'ఆర్డర్ విజయవంతంగా నమోదు అయింది')}</p>
        <h1 className="display-md" style={{textAlign:'center', margin:'0.5rem 0'}}>{t('Thank You!', 'ధన్యవాదాలు!')}</h1>
        <p style={{textAlign:'center', color:'var(--sage)', marginBottom:'2rem'}}>
          {t(`Order #${orderNumber} confirmed. We'll notify you when it's shipped.`,
             `ఆర్డర్ #${orderNumber} నిర్ధారించబడింది. షిప్ అయినప్పుడు మీకు తెలియజేస్తాం.`)}
        </p>

        {order && (
          <div className="confirm-card">
            <div className="confirm-items">
              {order.order_items?.map(item => (
                <div key={item.id} className="confirm-item">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="confirm-totals">
              {order.discount_amount > 0 && (
                <div className="total-row"><span>{t('Discount', 'తగ్గింపు')}</span><span style={{color:'#27ae60'}}>−₹{order.discount_amount.toFixed(2)}</span></div>
              )}
              <div className="total-row"><span>{t('Shipping', 'షిప్పింగ్')}</span><span>{order.shipping_charge === 0 ? t('Free','ఉచితం') : `₹${order.shipping_charge}`}</span></div>
              <div className="total-row total-final"><span>{t('Total Paid', 'మొత్తం చెల్లించారు')}</span><span>₹{order.total_amount?.toFixed(2)}</span></div>
            </div>
          </div>
        )}

        <div className="confirm-actions">
          <Link to={`/track/${orderNumber}`} className="btn btn-primary">{t('Track Order', 'ఆర్డర్ ట్రాక్ చేయండి')}</Link>
          <Link to="/shop" className="btn btn-outline">{t('Continue Shopping', 'షాపింగ్ కొనసాగించండి')}</Link>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmationPage;
