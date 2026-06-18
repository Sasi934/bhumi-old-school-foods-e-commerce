import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import NotifyMeModal from './NotifyMeModal';
import './ProductCard.css';

const CATEGORY_IMAGES = {
  'flours-mixes':      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  'millets':           'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'rice-pulses':       'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=80',
  'spices-powders':    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  'natural-care':      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
  'cold-pressed-oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  'pickles':           'https://images.unsplash.com/photo-1589135716383-9f98e8a2e6e4?w=400&q=80',
  'sweeteners-snacks': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
};

const getProductImage = (product) => {
  if (product.image_url) return product.image_url;
  const slug = product.categories?.slug || 'default';
  return CATEGORY_IMAGES[slug] || CATEGORY_IMAGES['flours-mixes'];
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { lang, t } = useLang();
  const [showNotify, setShowNotify] = useState(false);

  const displayName = lang === 'te' && product.name_telugu ? product.name_telugu : product.name;
  const isOutOfStock = product.out_of_stock === true;
  const discount = product.original_price > product.price && product.price > 0
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <>
      <div className={`product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
        <Link to={`/product/${product.slug}`} className="product-card-image-wrap">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className={`product-card-image ${isOutOfStock ? 'oos-image' : ''}`}
            loading="lazy"
          />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="oos-overlay">
              <span className="oos-badge-large">Out of Stock</span>
            </div>
          )}

          {/* Featured Badge */}
          {product.is_featured && !isOutOfStock && (
            <span className="product-badge">{t('Featured', 'ఫీచర్డ్')}</span>
          )}

          {/* Discount Badge */}
          {discount > 0 && !isOutOfStock && (
            <span className="discount-badge">-{discount}%</span>
          )}

          {/* Hover overlay */}
          {!isOutOfStock && (
            <div className="product-card-hover">
              <span>{t('View Details', 'వివరాలు చూడండి')} →</span>
            </div>
          )}
        </Link>

        <div className="product-card-body">
          <p className="product-category eyebrow">
            {t(product.categories?.name || '', product.categories?.name_telugu || '')}
          </p>
          <h3 className="product-name">
            <Link to={`/product/${product.slug}`}>{displayName}</Link>
          </h3>

          <div className="product-card-footer">
            <div className="product-price">
              {isOutOfStock ? (
                <span className="oos-text">{t('Out of Stock', 'స్టాక్ లేదు')}</span>
              ) : product.price > 0 ? (
                <>
                  <span>₹{product.price.toFixed(2)}</span>
                  {discount > 0 && (
                    <span className="original-price">₹{product.original_price.toFixed(2)}</span>
                  )}
                  <small>/ {product.unit}</small>
                </>
              ) : (
                <span className="price-tbd">{t('Price on request', 'ధర అభ్యర్థనపై')}</span>
              )}
            </div>

            {/* Add to Cart OR Notify Me */}
            {isOutOfStock ? (
              <button
                className="notify-btn"
                onClick={(e) => { e.preventDefault(); setShowNotify(true); }}
                title={t('Notify Me', 'నోటిఫై చేయండి')}
              >
                🔔
              </button>
            ) : (
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(product)}
                title={t('Add to bag', 'బ్యాగ్‌కి చేర్చండి')}
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notify Me Modal */}
      {showNotify && (
        <NotifyMeModal
          product={product}
          onClose={() => setShowNotify(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
