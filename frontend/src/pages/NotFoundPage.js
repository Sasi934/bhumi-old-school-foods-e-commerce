import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const NotFoundPage = () => {
  const { t } = useLang();
  return (
    <main style={{ paddingTop: '130px', paddingBottom: '6rem', minHeight: '100vh', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <p style={{ fontSize: '5rem', marginBottom: '1rem' }}>🌿</p>
        <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>404</p>
        <h1 className="display-md" style={{ marginBottom: '1rem' }}>
          {t('Page Not Found', 'పేజీ కనుగొనబడలేదు')}
        </h1>
        <p style={{ color: 'var(--sage)', marginBottom: '2rem', lineHeight: 1.7 }}>
          {t(
            "Looks like this page wandered off to the farm. Let's get you back.",
            'ఈ పేజీ పొలానికి వెళ్ళిపోయినట్లు కనిపిస్తోంది. మీరు తిరిగి వెళ్ళండి.'
          )}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">{t('Go Home', 'హోమ్‌కి వెళ్ళండి')}</Link>
          <Link to="/shop" className="btn btn-outline">{t('Browse Shop', 'షాప్ చూడండి')}</Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
