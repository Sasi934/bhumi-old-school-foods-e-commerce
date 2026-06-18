import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLang } from '../context/LangContext';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const CATEGORIES_DISPLAY = [
  { slug: 'flours-mixes',      en: 'Flours & Mixes',     te: 'పిండి & మిక్స్',     img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80', icon: '🌾' },
  { slug: 'millets',           en: 'Millets',             te: 'చిరుధాన్యాలు',         img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80', icon: '🌾' },
  { slug: 'rice-pulses',       en: 'Rice & Pulses',       te: 'బియ్యం & పప్పు',     img: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=300&q=80', icon: '🍚' },
  { slug: 'spices-powders',    en: 'Spices & Powders',    te: 'మసాలాలు',             img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80', icon: '🌶️' },
  { slug: 'cold-pressed-oils', en: 'Cold Pressed Oils',   te: 'చల్లని నూనెలు',      img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80', icon: '🥥' },
  { slug: 'pickles',           en: 'Pickles',             te: 'ఊరగాయలు',             img: 'https://images.unsplash.com/photo-1589135716383-9f98e8a2e6e4?w=300&q=80', icon: '🥒' },
  { slug: 'natural-care',      en: 'Natural Care',        te: 'సహజ సంరక్షణ',        img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&q=80', icon: '🛁' },
  { slug: 'sweeteners-snacks', en: 'Snacks & Sweets',     te: 'స్నాక్స్ & తీపి',    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', icon: '🍯' },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name, name_telugu, slug)')
        .eq('is_featured', true)
        .eq('is_available', true)
        .limit(8);
      setFeatured(data || []);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  return (
    <main className="homepage">
      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1546548970-71785318a17b?w=1600&q=85"
            alt="Organic harvest"
            className="hero-img"
          />
          <div className="hero-overlay" />
        </div>
        <div className="container hero-content">
          <div className="hero-text animate-in">
            <p className="eyebrow hero-eyebrow">{t('Issue N° 01 · Est. 2026', 'సంచిక N° 01 · స్థాపించబడింది 2026')}</p>
            <h1 className="hero-headline display-xl">
              {t('From soil', 'మట్టి నుండి')}
              <br />
              <em className="hero-headline-gold">{t('to your table.', 'మీ భోజనానికి.')}</em>
            </h1>
            <p className="hero-sub">
              {t('100 organic harvests, hand-selected from native farms of Andhra & Telangana.',
                 '100 సేంద్రీయ పంటలు, ఆంధ్ర & తెలంగాణ స్వదేశీ పొలాల నుండి చేతితో ఎంచుకున్నవి.')}
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-gold">
                {t('Explore the Harvest', 'పంటను అన్వేషించండి')} →
              </Link>
              <Link to="/shop?featured=true" className="btn btn-outline hero-outline">
                {t('Our Story', 'మా గురించి')}
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <span>SCROLL ↓</span>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="trust-bar">
        <div className="container trust-bar-inner">
          {[
            { icon: '🌿', en: '100% Organic', te: '100% సేంద్రీయ' },
            { icon: '🪨', en: 'Stone Ground', te: 'రాతి మరలు' },
            { icon: '🚚', en: 'Free Shipping ₹500+', te: 'ఉచిత షిప్పింగ్ ₹500+' },
            { icon: '🤝', en: 'Farm Direct', te: 'నేరుగా పొలం నుండి' },
            { icon: '🧪', en: 'No Preservatives', te: 'సంరక్షకాలు లేవు' },
          ].map(item => (
            <div key={item.en} className="trust-item">
              <span className="trust-icon">{item.icon}</span>
              <span className="trust-text">{t(item.en, item.te)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow" style={{color:'var(--gold)'}}>{t('By Category', 'వర్గం ప్రకారం')}</p>
            <h2 className="display-md" style={{marginTop:'0.5rem'}}>
              {t('Shop the Collection', 'సేకరణను షాప్ చేయండి')}
            </h2>
            <div className="divider" />
          </div>
          <div className="categories-grid">
            {CATEGORIES_DISPLAY.map((cat, i) => (
              <Link key={cat.slug} to={`/shop/${cat.slug}`} className="category-card"
                style={{animationDelay: `${i * 0.05}s`}}>
                <div className="category-img-wrap">
                  <img src={cat.img} alt={cat.en} />
                  <div className="category-overlay" />
                </div>
                <div className="category-label">
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{t(cat.en, cat.te)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURE BANNER ─── */}
      <section className="feature-banner">
        <div className="feature-banner-bg">
          <img
            src="https://images.unsplash.com/photo-1543362906-acfc16c67564?w=1400&q=80"
            alt="Traditional cooking"
          />
          <div className="feature-banner-overlay" />
        </div>
        <div className="container feature-banner-content">
          <p className="eyebrow" style={{color:'var(--gold-light)'}}>{t('The Bhumi Way', 'భూమి తీరు')}</p>
          <h2 className="display-lg" style={{color:'var(--cream)', marginTop:'0.75rem'}}>
            {t('Old methods.', 'పాత పద్ధతులు.')}
            <br />
            {t('Better nutrition.', 'మెరుగైన పోషణ.')}
          </h2>
          <div className="divider" style={{background:'var(--gold)'}} />
          <p style={{color:'rgba(245,240,232,0.8)', maxWidth:'500px', marginBottom:'2rem', lineHeight:'1.8'}}>
            {t('We revive the wisdom of our grandmothers — stone-ground flours, cold-pressed oils, sprouted grains. No shortcuts. Just pure food.',
               'మా అమ్మమ్మల జ్ఞానాన్ని పునరుద్ధరిస్తున్నాం — రాతి మరలు, చల్లని నూనెలు, మొలకెత్తిన ధాన్యాలు. సత్వర మార్గాలు లేవు. నిజమైన ఆహారం మాత్రమే.')}
          </p>
          <Link to="/shop" className="btn btn-gold">{t('Discover More', 'మరింత కనుగొనండి')} →</Link>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow" style={{color:'var(--gold)'}}>{t("This Week's Harvest", 'ఈ వారపు పంట')}</p>
            <h2 className="display-md" style={{marginTop:'0.5rem'}}>
              {t('Handpicked for You', 'మీ కోసం ఎంచుకున్నవి')}
            </h2>
            <div className="divider" />
          </div>

          {loading ? (
            <div className="loading-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton" />
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div style={{textAlign:'center', marginTop:'3rem'}}>
            <Link to="/shop" className="btn btn-outline" style={{padding:'1rem 3rem'}}>
              {t('View All Products', 'అన్ని ఉత్పత్తులు చూడండి')} →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ABOUT STRIP ─── */}
      <section className="about-strip section-sm">
        <div className="container about-strip-inner">
          <div className="about-strip-text">
            <p className="eyebrow" style={{color:'var(--gold)'}}>{t('Who We Are', 'మేము ఎవరు')}</p>
            <h2 className="display-md" style={{marginTop:'0.5rem', marginBottom:'1rem'}}>
              {t('Rooted in tradition.', 'సాంప్రదాయంలో వేళ్ళూనుకున్న.')}
              <br />
              {t('Grown with love.', 'ప్రేమతో పెంచిన.')}
            </h2>
            <div className="divider" />
            <p className="body-lg" style={{color:'var(--sage)', marginTop:'1rem', maxWidth:'500px'}}>
              {t('Bhumi Old School Foods brings you the finest organic produce from Telugu farmlands. Every product carries the wisdom of generations and the purity of nature.',
                 'భూమి ఓల్డ్ స్కూల్ ఫుడ్స్ తెలుగు వ్యవసాయ భూముల నుండి అత్యుత్తమ సేంద్రీయ ఉత్పత్తులను అందిస్తుంది.')}
            </p>
          </div>
          <div className="about-strip-img">
            <img
              src="https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=700&q=85"
              alt="Organic farm"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
