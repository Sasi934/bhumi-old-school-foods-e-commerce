import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-main">{t('Bhumi', 'భూమి')}</span>
              <span className="logo-sub">{t('Old School Foods', 'ఓల్డ్ స్కూల్ ఫుడ్స్')}</span>
            </div>
            <div className="divider" />
            <p className="footer-tagline">
              {t('From the soil to your table. 100% organic, traditionally grown.',
                 'మట్టి నుండి మీ భోజనం వరకు. 100% సేంద్రీయ, సాంప్రదాయకంగా పెంచినది.')}
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">{t('Shop', 'షాప్')}</h4>
            <ul>
              {[
                ['flours-mixes', 'Flours & Mixes', 'పిండి & మిక్స్'],
                ['millets', 'Millets', 'చిరుధాన్యాలు'],
                ['rice-pulses', 'Rice & Pulses', 'బియ్యం & పప్పు'],
                ['spices-powders', 'Spices & Powders', 'మసాలాలు'],
                ['cold-pressed-oils', 'Cold Pressed Oils', 'నూనెలు'],
                ['pickles', 'Pickles', 'ఊరగాయలు'],
              ].map(([slug, en, te]) => (
                <li key={slug}>
                  <Link to={`/shop/${slug}`} className="footer-link">{t(en, te)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">{t('More', 'మరిన్ని')}</h4>
            <ul>
              <li><Link to="/shop/natural-care" className="footer-link">{t('Natural Care', 'సహజ సంరక్షణ')}</Link></li>
              <li><Link to="/shop/sweeteners-snacks" className="footer-link">{t('Snacks & Sweets', 'స్నాక్స్')}</Link></li>
              <li><Link to="/shop" className="footer-link">{t('All Products', 'అన్ని ఉత్పత్తులు')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">{t('Contact', 'సంప్రదించండి')}</h4>
            <p className="footer-contact">📍 {t('Hyderabad, Telangana', 'హైదరాబాద్, తెలంగాణ')}</p>
            <p className="footer-contact">📞 +91 XXXXX XXXXX</p>
            <p className="footer-contact">✉️ hello@bhumifoods.in</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('© 2026 Bhumi Old School Foods. All rights reserved.', '© 2026 భూమి ఓల్డ్ స్కూల్ ఫుడ్స్. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.')}</p>
          <p>{t('Made with 🌿 in Hyderabad', 'హైదరాబాద్‌లో 🌿 తో తయారు చేయబడింది')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
