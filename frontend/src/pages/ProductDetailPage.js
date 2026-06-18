import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import ProductCard from '../components/ProductCard';
import NotifyMeModal from '../components/NotifyMeModal';
import './ProductDetailPage.css';

const CATEGORY_IMAGES = {
  'flours-mixes': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&q=85',
  'millets': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&q=85',
  'rice-pulses': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=700&q=85',
  'spices-powders': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&q=85',
  'natural-care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=85',
  'cold-pressed-oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=700&q=85',
  'pickles': 'https://images.unsplash.com/photo-1589135716383-9f98e8a2e6e4?w=700&q=85',
  'sweeteners-snacks': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85',
  default: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=700&q=85',
};

const StarRating = ({ value, onChange, size = 20 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1,2,3,4,5].map(star => (
      <button key={star} type="button" onClick={() => onChange && onChange(star)} style={{
        background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default',
        color: star <= value ? '#f39c12' : '#ddd', fontSize: size, padding: '0 1px', lineHeight: 1
      }}>★</button>
    ))}
  </div>
);

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct]               = useState(null);
  const [related, setRelated]               = useState([]);
  const [reviews, setReviews]               = useState([]);
  const [quantity, setQuantity]             = useState(1);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState('details');
  const [added, setAdded]                   = useState(false);
  const [showNotify, setShowNotify]         = useState(false);   // ← NEW
  const [reviewForm, setReviewForm]         = useState({ reviewer_name:'', reviewer_email:'', rating:5, title:'', body:'' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted]   = useState(false);
  const { addToCart } = useCart();
  const { lang, t } = useLang();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: p } = await supabase.from('products')
        .select('*, categories(name, name_telugu, slug)').eq('slug', slug).single();
      setProduct(p);
      if (p) {
        const [{ data: rel }, { data: rev }] = await Promise.all([
          supabase.from('products').select('*, categories(name, name_telugu, slug)')
            .eq('category_id', p.category_id).neq('id', p.id).eq('is_available', true).limit(4),
          supabase.from('reviews').select('*').eq('product_id', p.id).eq('is_approved', true)
            .order('created_at', { ascending: false })
        ]);
        setRelated(rel || []);
        setReviews(rev || []);
      }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.reviewer_name || !reviewForm.rating) return;
    setReviewSubmitting(true);
    await supabase.from('reviews').insert({ ...reviewForm, product_id: product.id });
    setReviewSubmitted(true);
    setReviewForm({ reviewer_name:'', reviewer_email:'', rating:5, title:'', body:'' });
    const { data: rev } = await supabase.from('reviews').select('*')
      .eq('product_id', product.id).eq('is_approved', true)
      .order('created_at', { ascending: false });
    setReviews(rev || []);
    setReviewSubmitting(false);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const discount = product?.original_price > product?.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  // ─── Loading skeleton ───
  if (loading) return (
    <div className="container" style={{paddingTop:'130px', paddingBottom:'4rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem'}}>
      {[1,2].map(i => (
        <div key={i} style={{background:'var(--cream-dark)', borderRadius:'var(--radius-lg)', minHeight:'400px', animation:'shimmer 1.5s infinite'}} />
      ))}
    </div>
  );

  // ─── Not found ───
  if (!product) return (
    <div style={{paddingTop:'130px', textAlign:'center', padding:'8rem 2rem'}}>
      <h2>{t('Product not found','ఉత్పత్తి కనుగొనబడలేదు')}</h2>
      <Link to="/shop" className="btn btn-outline" style={{marginTop:'1.5rem', display:'inline-flex'}}>
        {t('Back to Shop','షాప్‌కి వెళ్ళండి')}
      </Link>
    </div>
  );

  const productImg   = product.image_url || CATEGORY_IMAGES[product.categories?.slug] || CATEGORY_IMAGES.default;
  const displayName  = lang === 'te' && product.name_telugu ? product.name_telugu : product.name;
  const displayDesc  = lang === 'te' && product.description_telugu ? product.description_telugu : product.description;
  const isOutOfStock = product.out_of_stock === true;   // ← NEW

  return (
    <main className="detail-page">

      {/* ─── Breadcrumb ─── */}
      <div className="detail-breadcrumb container">
        <Link to="/">{t('Home','హోమ్')}</Link> <span>·</span>
        <Link to="/shop">{t('Shop','షాప్')}</Link>
        {product.categories && (
          <>
            <span>·</span>
            <Link to={`/shop/${product.categories.slug}`}>
              {t(product.categories.name, product.categories.name_telugu)}
            </Link>
          </>
        )}
        <span>·</span>
        <span style={{color:'var(--forest)', fontWeight:500}}>{product.name}</span>
      </div>

      {/* ─── Product Grid ─── */}
      <div className="container detail-grid">

        {/* Image Column */}
        <div className="detail-image-col">
          <div className="detail-image-wrap">
            <img src={productImg} alt={product.name} className="detail-image" />

            {/* Out of Stock overlay on image */}
            {isOutOfStock && (
              <div className="detail-oos-overlay">
                <span className="detail-oos-badge">Out of Stock</span>
              </div>
            )}

            {discount > 0 && !isOutOfStock && (
              <span className="detail-discount-badge">-{discount}%</span>
            )}
            {product.is_featured && (
              <span className="detail-badge">{t('Featured','ఫీచర్డ్')}</span>
            )}
          </div>

          {product.tags?.length > 0 && (
            <div className="detail-tags">
              {product.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="detail-info-col">
          {product.categories && (
            <p className="eyebrow detail-cat" style={{color:'var(--gold)'}}>
              {t(product.categories.name, product.categories.name_telugu)}
            </p>
          )}

          <h1 className="detail-name display-md">{displayName}</h1>

          {/* Star rating */}
          {avgRating && (
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', margin:'0.5rem 0'}}>
              <StarRating value={Math.round(parseFloat(avgRating))} size={16} />
              <span style={{fontSize:'0.82rem', color:'var(--sage)'}}>
                {avgRating} ({reviews.length} {t('reviews','సమీక్షలు')})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="detail-price-row">
            {isOutOfStock ? (
              <span className="detail-oos-price-text">
                ⚠️ {t('Currently Out of Stock','ప్రస్తుతం స్టాక్ లేదు')}
              </span>
            ) : product.price > 0 ? (
              <>
                <span className="detail-price">₹{product.price.toFixed(2)}</span>
                {product.original_price > product.price && (
                  <span className="detail-original-price">₹{product.original_price.toFixed(2)}</span>
                )}
                {discount > 0 && (
                  <span className="detail-discount-tag">{discount}% {t('off','తగ్గింపు')}</span>
                )}
              </>
            ) : (
              <span className="detail-price-tbd">{t('Price on request','ధర అభ్యర్థనపై')}</span>
            )}
          </div>

          {!isOutOfStock && <p className="detail-unit">/ {product.unit}</p>}
          <div className="divider" style={{margin:'1rem 0'}} />

          <p className="detail-description">{displayDesc}</p>

          {/* ─── PURCHASE SECTION ─── */}
          <div className="detail-purchase">
            {isOutOfStock ? (
              // ─── OUT OF STOCK UI ───
              <div className="oos-section">
                <div className="oos-banner">
                  <span className="oos-icon">⚠️</span>
                  <div>
                    <p className="oos-banner-title">
                      {t('Currently Out of Stock','ప్రస్తుతం స్టాక్ లేదు')}
                    </p>
                    <p className="oos-banner-sub">
                      {t(
                        'This product is temporarily unavailable. Click below to get notified when it\'s back!',
                        'ఈ ఉత్పత్తి తాత్కాలికంగా అందుబాటులో లేదు. తిరిగి వచ్చినప్పుడు నోటిఫై పొందండి!'
                      )}
                    </p>
                  </div>
                </div>

                <button
                  className="btn notify-me-large"
                  onClick={() => setShowNotify(true)}
                >
                  🔔 {t('Notify Me When Available','అందుబాటులోకి వచ్చినప్పుడు తెలియజేయండి')}
                </button>

                <p className="oos-note">
                  {t(
                    'We\'ll send you an email/SMS as soon as this product is restocked.',
                    'ఈ ఉత్పత్తి స్టాక్‌లోకి వచ్చిన వెంటనే మేము మీకు ఇమెయిల్/SMS పంపుతాము.'
                  )}
                </p>
              </div>
            ) : (
              // ─── IN STOCK UI ───
              <>
                <div className="qty-row">
                  <label className="eyebrow">{t('Quantity','పరిమాణం')}</label>
                  <div className="qty-control-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                </div>

                <button
                  className={`btn ${added ? 'btn-gold' : 'btn-primary'} add-to-cart-large`}
                  onClick={handleAddToCart}
                >
                  {added
                    ? t('✓ Added to Bag','✓ బ్యాగ్‌కు చేర్చబడింది')
                    : product.price > 0
                      ? `${t('Add to Bag','బ్యాగ్‌కి చేర్చండి')} — ₹${(product.price * quantity).toFixed(2)}`
                      : t('Add to Bag','బ్యాగ్‌కి చేర్చండి')}
                </button>

                <p style={{fontSize:'0.75rem', color:'var(--sage)', textAlign:'center', marginTop:'0.6rem'}}>
                  🚚 {t('Free shipping on orders above ₹500','₹500 పైన ఉచిత షిప్పింగ్')}
                </p>
              </>
            )}
          </div>

          {/* ─── Tabs ─── */}
          <div className="detail-tabs">
            {['details','origin','shipping'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab===tab?'active':''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab==='details' ? t('Details','వివరాలు')
                  : tab==='origin' ? t('Origin','మూలం')
                  : t('Shipping','షిప్పింగ్')}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab==='details' && (
              <div style={{fontSize:'0.875rem', lineHeight:1.8, color:'var(--sage)'}}>
                <p>✅ {t('100% organic, no preservatives','100% సేంద్రీయ, సంరక్షకాలు లేవు')}</p>
                <p>⚖️ {t('Unit','యూనిట్')}: {product.unit}</p>
                {product.stock_quantity < 20 && !isOutOfStock && (
                  <p style={{color:'#c0392b'}}>⚡ {t('Only a few left!','కొన్నే మిగిలాయి!')}</p>
                )}
              </div>
            )}
            {activeTab==='origin' && (
              <p style={{fontSize:'0.875rem', color:'var(--sage)', lineHeight:1.8}}>
                {t(
                  'Sourced directly from native farms of Andhra Pradesh and Telangana. Grown without chemicals, harvested at peak ripeness.',
                  'ఆంధ్రప్రదేశ్ మరియు తెలంగాణ స్వదేశీ పొలాల నుండి నేరుగా సేకరించబడింది.'
                )}
              </p>
            )}
            {activeTab==='shipping' && (
              <div style={{fontSize:'0.875rem', color:'var(--sage)', lineHeight:1.8}}>
                <p>🚚 {t('Free shipping above ₹500','₹500 పైన ఉచిత షిప్పింగ్')}</p>
                <p>📦 {t('Delivered in 3–5 business days','3–5 వ్యాపార దినాలలో డెలివరీ')}</p>
                <p>↩️ {t('Easy returns within 7 days','7 రోజులలో తిరిగి ఇవ్వడం')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── REVIEWS ─── */}
      <section className="reviews-section container">
        <p className="eyebrow" style={{color:'var(--gold)'}}>
          {t('Customer Reviews','కస్టమర్ సమీక్షలు')}
        </p>
        <h2 className="display-md" style={{marginTop:'0.4rem', marginBottom:'2rem'}}>
          {avgRating
            ? `${avgRating} ★ · ${reviews.length} ${t('reviews','సమీక్షలు')}`
            : t('No reviews yet','ఇంకా సమీక్షలు లేవు')}
        </h2>

        <div className="reviews-grid">
          {/* Review list */}
          <div className="reviews-list">
            {reviews.length===0 && (
              <p style={{color:'var(--sage)', fontStyle:'italic'}}>
                {t('Be the first to review!','మొదట సమీక్షించండి!')}
              </p>
            )}
            {reviews.map(r => (
              <div key={r.id} className="review-card">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.4rem'}}>
                  <div>
                    <p style={{fontWeight:600, fontSize:'0.9rem'}}>{r.reviewer_name}</p>
                    <StarRating value={r.rating} size={14} />
                  </div>
                  <p style={{fontSize:'0.72rem', color:'var(--sage)'}}>
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                {r.title && (
                  <p style={{fontWeight:600, fontSize:'0.875rem', marginBottom:'0.2rem'}}>{r.title}</p>
                )}
                {r.body && (
                  <p style={{fontSize:'0.875rem', color:'var(--sage)', lineHeight:1.7}}>{r.body}</p>
                )}
              </div>
            ))}
          </div>

          {/* Write review form */}
          <div className="write-review-card">
            <h3 style={{fontSize:'1rem', fontWeight:600, marginBottom:'1.25rem'}}>
              {t('Write a Review','సమీక్ష రాయండి')}
            </h3>
            {reviewSubmitted ? (
              <div style={{textAlign:'center', padding:'2rem 0'}}>
                <p style={{fontSize:'2rem', marginBottom:'0.5rem'}}>🌿</p>
                <p style={{fontWeight:600}}>{t('Thank you!','ధన్యవాదాలు!')}</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{display:'flex', flexDirection:'column', gap:'0.875rem'}}>
                <div className="form-group">
                  <label>{t('Rating','రేటింగ్')} *</label>
                  <StarRating
                    value={reviewForm.rating}
                    onChange={r => setReviewForm({...reviewForm, rating:r})}
                    size={26}
                  />
                </div>
                <div className="form-group">
                  <label>{t('Name','పేరు')} *</label>
                  <input
                    value={reviewForm.reviewer_name}
                    onChange={e => setReviewForm({...reviewForm, reviewer_name:e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('Email (optional)','ఇమెయిల్')}</label>
                  <input
                    type="email"
                    value={reviewForm.reviewer_email}
                    onChange={e => setReviewForm({...reviewForm, reviewer_email:e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>{t('Title','శీర్షిక')}</label>
                  <input
                    value={reviewForm.title}
                    onChange={e => setReviewForm({...reviewForm, title:e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>{t('Review','సమీక్ష')}</label>
                  <textarea
                    value={reviewForm.body}
                    onChange={e => setReviewForm({...reviewForm, body:e.target.value})}
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting
                    ? t('Submitting...','సమర్పిస్తోంది...')
                    : t('Submit Review','సమీక్ష సమర్పించండి')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── Related Products ─── */}
      {related.length > 0 && (
        <section className="related-section container">
          <p className="eyebrow" style={{color:'var(--gold)'}}>
            {t('You May Also Like','మీకు ఇవి నచ్చవచ్చు')}
          </p>
          <h2 className="display-md" style={{marginTop:'0.4rem', marginBottom:'2rem'}}>
            {t('More from this Category','ఈ వర్గం నుండి మరిన్ని')}
          </h2>
          <div className="related-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ─── Notify Me Modal ─── */}
      {showNotify && (
        <NotifyMeModal
          product={product}
          onClose={() => setShowNotify(false)}
        />
      )}

    </main>
  );
};

export default ProductDetailPage;