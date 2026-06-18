import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './CheckoutPage.css';

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXX';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    line1: '', line2: '', city: '', state: 'Telangana', pincode: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=address, 2=review, 3=payment

  const shipping = cartTotal > 500 ? 0 : cartTotal > 0 ? 60 : 0;
  const discount = coupon
    ? coupon.type === 'percent'
      ? Math.min((cartTotal * coupon.value / 100), coupon.max_discount_amount || Infinity)
      : coupon.type === 'flat'
      ? Math.min(coupon.value, cartTotal)
      : 0
    : 0;
  const freeShipping = coupon?.type === 'free_shipping';
  const finalShipping = freeShipping ? 0 : shipping;
  const total = cartTotal - discount + finalShipping;

  const applyCoupon = async () => {
    setCouponError(''); setCouponLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) { setCouponError(t('Invalid coupon code', 'చెల్లని కూపన్ కోడ్')); }
    else if (data.min_order_amount > cartTotal) {
      setCouponError(t(`Min order ₹${data.min_order_amount} required`, `కనీస ఆర్డర్ ₹${data.min_order_amount} అవసరం`));
    } else if (data.valid_until && new Date(data.valid_until) < new Date()) {
      setCouponError(t('Coupon expired', 'కూపన్ గడువు మీరింది'));
    } else if (data.usage_limit && data.used_count >= data.usage_limit) {
      setCouponError(t('Coupon usage limit reached', 'కూపన్ వాడకం పరిమితి చేరింది'));
    } else {
      setCoupon(data);
    }
    setCouponLoading(false);
  };

  const generateOrderNumber = () => 'BHM-' + Math.random().toString(36).substr(2,8).toUpperCase();

  const handlePayment = async () => {
    setLoading(true);
    const orderNumber = generateOrderNumber();

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    script.onload = async () => {
      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Bhumi Old School Foods',
        description: `Order ${orderNumber}`,
        handler: async (response) => {
          await saveOrder(orderNumber, response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#1c2b1a' },
        modal: { ondismiss: () => setLoading(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    };
  };

  const saveOrder = async (orderNumber, paymentId, rzpOrderId, signature) => {
    const shippingAddr = { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode };

    const { data: order, error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: user?.id || null,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      shipping_address: shippingAddr,
      subtotal: cartTotal,
      discount_amount: discount,
      shipping_charge: finalShipping,
      total_amount: total,
      coupon_code: coupon?.code || null,
      coupon_id: coupon?.id || null,
      payment_status: 'paid',
      order_status: 'placed',
      razorpay_payment_id: paymentId,
      razorpay_order_id: rzpOrderId,
      razorpay_signature: signature,
    }).select().single();

    if (!error && order) {
      // Save items
      const items = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }));
      await supabase.from('order_items').insert(items);

      // Update coupon usage
      if (coupon) {
        await supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('id', coupon.id);
      }

      // Status history
      await supabase.from('order_status_history').insert({ order_id: order.id, status: 'placed', note: 'Order placed successfully' });

      clearCart();
      navigate(`/order-confirmation/${orderNumber}`);
    }
    setLoading(false);
  };

  if (cart.length === 0) return (
    <main className="checkout-page">
      <div className="container" style={{textAlign:'center', padding:'5rem 0'}}>
        <h2>{t('Your cart is empty', 'మీ కార్ట్ ఖాళీగా ఉంది')}</h2>
      </div>
    </main>
  );

  return (
    <main className="checkout-page">
      <div className="container checkout-grid">
        {/* Left - Form */}
        <div className="checkout-left">
          <div className="checkout-steps">
            {[t('Address','చిరునామా'), t('Review','సమీక్ష'), t('Payment','చెల్లింపు')].map((s, i) => (
              <div key={s} className={`step ${step === i+1 ? 'active' : step > i+1 ? 'done' : ''}`}>
                <span className="step-num">{step > i+1 ? '✓' : i+1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="checkout-section">
              <h2 className="checkout-heading">{t('Delivery Address', 'డెలివరీ చిరునామా')}</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('Full Name', 'పూర్తి పేరు')}</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>{t('Phone', 'ఫోన్')}</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>{t('Email', 'ఇమెయిల్')}</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>{t('Address Line 1', 'చిరునామా వరుస 1')}</label>
                <input value={form.line1} onChange={e => setForm({...form, line1: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>{t('Address Line 2 (optional)', 'చిరునామా వరుస 2 (ఐచ్ఛికం)')}</label>
                <input value={form.line2} onChange={e => setForm({...form, line2: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('City', 'నగరం')}</label>
                  <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>{t('State', 'రాష్ట్రం')}</label>
                  <select value={form.state} onChange={e => setForm({...form, state: e.target.value})}>
                    {['Telangana','Andhra Pradesh','Karnataka','Tamil Nadu','Maharashtra','Kerala','Other'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('Pincode', 'పిన్‌కోడ్')}</label>
                  <input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} required maxLength={6} />
                </div>
              </div>
              <button className="btn btn-primary" style={{width:'100%', justifyContent:'center', marginTop:'1rem'}}
                onClick={() => setStep(2)} disabled={!form.name || !form.phone || !form.line1 || !form.city || !form.pincode}>
                {t('Continue to Review', 'సమీక్షకు కొనసాగండి')} →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-section">
              <h2 className="checkout-heading">{t('Review Your Order', 'మీ ఆర్డర్ సమీక్షించండి')}</h2>
              <div className="review-items">
                {cart.map(item => (
                  <div key={item.id} className="review-item">
                    <span className="review-item-name">{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="address-review">
                <p className="eyebrow" style={{color:'var(--gold)', marginBottom:'0.5rem'}}>{t('Delivering to', 'డెలివరీ చిరునామా')}</p>
                <p>{form.name} · {form.phone}</p>
                <p>{form.line1}{form.line2 ? ', ' + form.line2 : ''}</p>
                <p>{form.city}, {form.state} - {form.pincode}</p>
              </div>
              <div style={{display:'flex', gap:'0.75rem', marginTop:'1.5rem'}}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>{t('← Edit Address', '← చిరునామా మార్చు')}</button>
                <button className="btn btn-primary" style={{flex:1, justifyContent:'center'}} onClick={() => setStep(3)}>
                  {t('Continue to Payment', 'చెల్లింపుకు కొనసాగండి')} →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-section">
              <h2 className="checkout-heading">{t('Payment', 'చెల్లింపు')}</h2>
              <div className="payment-info">
                <div className="payment-logos">
                  <span>💳</span><span>📱</span><span>🏦</span>
                  <p>{t('UPI · Cards · Net Banking · Wallets', 'UPI · కార్డులు · నెట్ బ్యాంకింగ్ · వాలెట్లు')}</p>
                </div>
                <p style={{fontSize:'0.85rem', color:'var(--sage)', marginTop:'1rem'}}>
                  {t('Secured by Razorpay. Your payment info is never stored on our servers.',
                     'Razorpay ద్వారా సురక్షితం. మీ చెల్లింపు సమాచారం మా సర్వర్‌లో నిల్వ చేయబడదు.')}
                </p>
              </div>
              <div style={{display:'flex', gap:'0.75rem', marginTop:'1.5rem'}}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>{t('← Back', '← వెనక్కి')}</button>
                <button className="btn btn-gold" style={{flex:1, justifyContent:'center', fontSize:'0.85rem'}}
                  onClick={handlePayment} disabled={loading}>
                  {loading ? t('Processing...', 'ప్రాసెస్ అవుతోంది...') : `${t('Pay Now', 'ఇప్పుడు చెల్లించండి')} ₹${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right - Summary */}
        <div className="checkout-right">
          <div className="order-summary">
            <h3 className="summary-heading">{t('Order Summary', 'ఆర్డర్ సారాంశం')}</h3>

            <div className="summary-items">
              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name} <small>×{item.quantity}</small></span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="coupon-section">
              <p className="eyebrow" style={{color:'var(--gold)', marginBottom:'0.6rem'}}>{t('Have a coupon?', 'కూపన్ ఉందా?')}</p>
              {coupon ? (
                <div className="coupon-applied">
                  <span>🎉 {coupon.code}</span>
                  <button onClick={() => { setCoupon(null); setCouponCode(''); }}>✕</button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={t('Enter code', 'కోడ్ ఎంటర్ చేయండి')}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  />
                  <button className="btn btn-outline" onClick={applyCoupon} disabled={couponLoading || !couponCode}>
                    {couponLoading ? '...' : t('Apply', 'వర్తించు')}
                  </button>
                </div>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}
              {coupon && <p className="coupon-success">✅ {coupon.description}</p>}
            </div>

            <div className="summary-totals">
              <div className="total-row"><span>{t('Subtotal', 'సబ్‌టోటల్')}</span><span>₹{cartTotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="total-row discount-row"><span>{t('Discount', 'తగ్గింపు')} ({coupon?.code})</span><span>−₹{discount.toFixed(2)}</span></div>}
              <div className="total-row"><span>{t('Shipping', 'షిప్పింగ్')}</span><span>{finalShipping === 0 ? t('Free','ఉచితం') : `₹${finalShipping}`}</span></div>
              <div className="total-row total-final"><span>{t('Total', 'మొత్తం')}</span><span>₹{total.toFixed(2)}</span></div>
            </div>

            {cartTotal > 0 && cartTotal < 500 && (
              <p className="free-shipping-hint">
                🚚 {t(`Add ₹${(500 - cartTotal).toFixed(0)} more for free shipping!`, `₹${(500 - cartTotal).toFixed(0)} మరింత చేర్చండి — ఉచిత డెలివరీ!`)}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
