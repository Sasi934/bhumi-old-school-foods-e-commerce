import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import './CartDrawer.css';

const CATEGORY_IMAGES = {
  'flours-mixes': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=80&q=80',
  'millets': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&q=80',
  'cold-pressed-oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=80&q=80',
  'pickles': 'https://images.unsplash.com/photo-1589135716383-9f98e8a2e6e4?w=80&q=80',
  'spices-powders': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=80&q=80',
  default: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=80&q=80'
};

const CartDrawer = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const { t } = useLang();

  const shipping = cartTotal > 500 ? 0 : cartTotal > 0 ? 60 : 0;
  const total = cartTotal + shipping;

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div className="cart-overlay animate-fade" onClick={() => setIsCartOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div>
            <p className="eyebrow" style={{color:'var(--gold)'}}>
              {t('Your Bag', 'మీ బ్యాగ్')}
            </p>
            <h3 className="cart-title">{cart.length} {t('items', 'వస్తువులు')}</h3>
          </div>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Free shipping bar */}
        {cartTotal > 0 && cartTotal < 500 && (
          <div className="shipping-bar">
            <p className="shipping-text">
              {t(`Add ₹${500 - cartTotal} more for free shipping`, `₹${500 - cartTotal} మరింత చేర్చండి - ఉచిత డెలివరీ`)}
            </p>
            <div className="shipping-progress">
              <div className="shipping-fill" style={{width: `${(cartTotal/500)*100}%`}} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>{t('Your bag is empty', 'మీ బ్యాగ్ ఖాళీగా ఉంది')}</p>
              <Link to="/shop" className="btn btn-outline" style={{marginTop:'1rem'}}
                onClick={() => setIsCartOpen(false)}>
                {t('Shop Now', 'షాప్ చేయండి')}
              </Link>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image_url || CATEGORY_IMAGES[item.categories?.slug] || CATEGORY_IMAGES.default}
                  alt={item.name}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-unit">{item.unit}</p>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="cart-item-price">
                      {item.price ? `₹${(item.price * item.quantity).toFixed(2)}` : t('Price TBD', 'ధర తర్వాత')}
                    </span>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-totals">
              <div className="total-row">
                <span>{t('Subtotal', 'సబ్‌టోటల్')}</span>
                <span>{cartTotal > 0 ? `₹${cartTotal.toFixed(2)}` : t('TBD', 'TBD')}</span>
              </div>
              <div className="total-row">
                <span>{t('Shipping', 'షిప్పింగ్')}</span>
                <span>{shipping === 0 ? t('Free', 'ఉచితం') : `₹${shipping}`}</span>
              </div>
              <div className="total-row total-final">
                <span>{t('Total', 'మొత్తం')}</span>
                <span>{total > 0 ? `₹${total.toFixed(2)}` : t('TBD', 'TBD')}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn btn-primary" style={{width:'100%', justifyContent:'center'}}
              onClick={() => setIsCartOpen(false)}>
              {t('Proceed to Checkout', 'చెక్అవుట్ కి వెళ్ళండి')} →
            </Link>
            <button className="btn btn-ghost" style={{width:'100%', justifyContent:'center', marginTop:'0.75rem'}}
              onClick={() => setIsCartOpen(false)}>
              {t('Continue Shopping', 'షాపింగ్ కొనసాగించండి')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
