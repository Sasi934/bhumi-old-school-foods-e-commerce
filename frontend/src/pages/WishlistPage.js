// WishlistPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const WishlistPage = () => {
  const { t } = useLang();
  return (
    <main style={{paddingTop:'100px', paddingBottom:'5rem', minHeight:'100vh'}}>
      <div className="container" style={{maxWidth:'700px', textAlign:'center', paddingTop:'3rem'}}>
        <p style={{fontSize:'3rem', marginBottom:'1rem'}}>❤️</p>
        <p className="eyebrow" style={{color:'var(--gold)'}}>{t('Wishlist', 'విష్‌లిస్ట్')}</p>
        <h1 className="display-md" style={{margin:'0.5rem 0 1rem'}}>{t('Your Saved Items', 'మీ సేవ్ చేసిన వస్తువులు')}</h1>
        <p style={{color:'var(--sage)', marginBottom:'2rem'}}>{t('Save products you love for later.', 'మీకు నచ్చిన ఉత్పత్తులు తర్వాత కోసం సేవ్ చేయండి.')}</p>
        <Link to="/shop" className="btn btn-primary">{t('Browse Products', 'ఉత్పత్తులు చూడండి')}</Link>
      </div>
    </main>
  );
};

export default WishlistPage;
