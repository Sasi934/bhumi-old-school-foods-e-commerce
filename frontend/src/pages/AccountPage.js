import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './AuthPages.css';

const AccountPage = () => {
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return (
    <main className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <p style={{fontSize:'2rem', marginBottom:'1rem'}}>👤</p>
        <h2>{t('Please sign in', 'దయచేసి లాగిన్ చేయండి')}</h2>
        <Link to="/login" className="btn btn-primary" style={{marginTop:'1.5rem', display:'inline-flex'}}>{t('Sign In', 'లాగిన్')}</Link>
      </div>
    </main>
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <main style={{paddingTop:'100px', paddingBottom:'5rem', minHeight:'100vh', background:'var(--cream)'}}>
      <div className="container" style={{maxWidth:'700px'}}>
        <div style={{marginBottom:'2rem'}}>
          <p className="eyebrow" style={{color:'var(--gold)'}}>{t('My Account', 'నా అకౌంట్')}</p>
          <h1 className="display-md" style={{marginTop:'0.5rem'}}>{t('Hello,', 'నమస్కారం,')} {profile?.full_name || user.email.split('@')[0]} 👋</h1>
        </div>

        {/* Quick Links */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem'}}>
          {[
            { to:'/orders', icon:'📦', label:t('My Orders','నా ఆర్డర్లు') },
            { to:'/wishlist', icon:'❤️', label:t('Wishlist','విష్‌లిస్ట్') },
            ...(isAdmin ? [{ to:'/admin', icon:'⚙️', label:t('Admin Panel','అడ్మిన్ ప్యానెల్') }] : []),
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'1.25rem',
              boxShadow:'var(--shadow-sm)', textAlign:'center', display:'block',
              color:'var(--forest)', transition:'var(--transition)'
            }}>
              <p style={{fontSize:'1.75rem', marginBottom:'0.4rem'}}>{link.icon}</p>
              <p style={{fontWeight:600, fontSize:'0.875rem'}}>{link.label}</p>
            </Link>
          ))}
        </div>

        {/* Profile Form */}
        <div style={{background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'2rem', boxShadow:'var(--shadow-sm)', marginBottom:'1.25rem'}}>
          <h2 style={{fontSize:'1.1rem', fontWeight:600, marginBottom:'1.5rem'}}>{t('Profile Details', 'ప్రొఫైల్ వివరాలు')}</h2>
          <form onSubmit={handleSave} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <div className="form-group">
              <label>{t('Full Name', 'పూర్తి పేరు')}</label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{t('Email', 'ఇమెయిల్')}</label>
              <input value={user.email} disabled style={{opacity:0.6}} />
            </div>
            <div className="form-group">
              <label>{t('Phone', 'ఫోన్')}</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
            </div>
            <button type="submit" className="btn btn-primary" style={{alignSelf:'flex-start'}} disabled={saving}>
              {saved ? t('✅ Saved!', '✅ సేవ్ అయింది!') : saving ? t('Saving...', 'సేవ్ అవుతోంది...') : t('Save Changes', 'మార్పులు సేవ్ చేయండి')}
            </button>
          </form>
        </div>

        {/* Sign Out */}
        <button className="btn btn-outline" onClick={handleSignOut} style={{width:'100%', justifyContent:'center'}}>
          🚪 {t('Sign Out', 'లాగ్ అవుట్')}
        </button>
      </div>
    </main>
  );
};

export default AccountPage;
