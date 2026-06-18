import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { lang, toggleLang, t } = useLang();
  const { user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/shop?search=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  const categories = [
    { slug: 'flours-mixes',      en: 'Flours & Mixes',     te: 'పిండి & మిక్స్' },
    { slug: 'millets',           en: 'Millets',             te: 'చిరుధాన్యాలు' },
    { slug: 'rice-pulses',       en: 'Rice & Pulses',       te: 'బియ్యం & పప్పు' },
    { slug: 'spices-powders',    en: 'Spices & Powders',    te: 'మసాలాలు' },
    { slug: 'cold-pressed-oils', en: 'Cold Pressed Oils',   te: 'చల్లని నూనెలు' },
    { slug: 'pickles',           en: 'Pickles',             te: 'ఊరగాయలు' },
    { slug: 'natural-care',      en: 'Natural Care',        te: 'సహజ సంరక్షణ' },
    { slug: 'sweeteners-snacks', en: 'Snacks & Sweets',     te: 'స్నాక్స్ & తీపి' },
  ];

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-main">{t('Bhumi', 'భూమి')}</span>
          <span className="logo-sub">{t('Old School Foods', 'ఓల్డ్ స్కూల్ ఫుడ్స్')}</span>
        </Link>

        <nav className="navbar-nav hide-mobile">
          <div className="nav-dropdown">
            <Link to="/shop" className="nav-link">{t('Shop', 'షాప్')}</Link>
            <div className="dropdown-menu">
              <Link to="/shop" className="dropdown-item all-item">{t('All Products', 'అన్ని ఉత్పత్తులు')}</Link>
              <div className="dropdown-divider" />
              {categories.map(cat => (
                <Link key={cat.slug} to={`/shop/${cat.slug}`} className="dropdown-item">{t(cat.en, cat.te)}</Link>
              ))}
            </div>
          </div>
          <Link to="/orders" className="nav-link">{t('Orders', 'ఆర్డర్లు')}</Link>
          {isAdmin && <Link to="/admin" className="nav-link admin-badge">⚙️ Admin</Link>}
        </nav>

        <div className="navbar-actions">
          <form onSubmit={handleSearch} className="search-form hide-mobile">
            <input type="text" placeholder={t('Search...', 'వెతకండి...')} value={search}
              onChange={e => setSearch(e.target.value)} className="search-input" />
            <button type="submit" className="search-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>

          <button className="lang-toggle" onClick={toggleLang}>
            <span className={lang === 'en' ? 'active' : ''}>EN</span>
            <span className="lang-sep">|</span>
            <span className={lang === 'te' ? 'active' : ''}>తె</span>
          </button>

          {user ? (
            <Link to="/account" className="auth-icon-btn" title="My Account">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {isAdmin && <span className="admin-dot" />}
            </Link>
          ) : (
            <Link to="/login" className="auth-icon-btn">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}

          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu animate-fade">
          <form onSubmit={handleSearch} className="mobile-search">
            <input type="text" placeholder={t('Search...', 'వెతకండి...')} value={search} onChange={e => setSearch(e.target.value)} />
          </form>
          <Link to="/shop" onClick={() => setMenuOpen(false)} className="mobile-link">{t('All Products', 'అన్ని ఉత్పత్తులు')}</Link>
          {categories.map(cat => (
            <Link key={cat.slug} to={`/shop/${cat.slug}`} onClick={() => setMenuOpen(false)} className="mobile-link">{t(cat.en, cat.te)}</Link>
          ))}
          <div style={{borderTop:'1px solid var(--cream-dark)', marginTop:'0.5rem', paddingTop:'0.5rem'}}>
            <Link to="/orders" onClick={() => setMenuOpen(false)} className="mobile-link">{t('My Orders', 'నా ఆర్డర్లు')}</Link>
            {user
              ? <Link to="/account" onClick={() => setMenuOpen(false)} className="mobile-link">👤 {t('My Account', 'నా అకౌంట్')}</Link>
              : <Link to="/login" onClick={() => setMenuOpen(false)} className="mobile-link">🔐 {t('Sign In', 'లాగిన్')}</Link>
            }
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="mobile-link">⚙️ Admin Panel</Link>}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
