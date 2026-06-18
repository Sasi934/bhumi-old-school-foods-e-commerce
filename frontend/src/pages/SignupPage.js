import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './AuthPages.css';

const SignupPage = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError(t('Passwords do not match','పాస్‌వర్డ్‌లు సరిపోలేదు')); return; }
    if (form.password.length < 6) { setError(t('Password must be at least 6 characters','పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి')); return; }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName);
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => navigate('/login'), 3000); }
  };

  if (success) return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-success">
          <div className="success-icon">✅</div>
          <h2>{t('Account Created!', 'అకౌంట్ సృష్టించబడింది!')}</h2>
          <p>{t('Please check your email to verify your account.', 'మీ ఇమెయిల్ తనిఖీ చేయండి.')}</p>
        </div>
      </div>
    </main>
  );

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-main">{t('Bhumi', 'భూమి')}</span>
            <span className="logo-sub">{t('Old School Foods', 'ఓల్డ్ స్కూల్ ఫుడ్స్')}</span>
          </Link>
          <div className="divider" />
          <h1 className="auth-title">{t('Create Account', 'నమోదు')}</h1>
          <p className="auth-sub">{t('Join the Bhumi family', 'భూమి కుటుంబంలో చేరండి')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('Full Name', 'పూర్తి పేరు')}</label>
            <input type="text" value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})}
              placeholder={t('Your name', 'మీ పేరు')} required />
          </div>
          <div className="form-group">
            <label>{t('Email', 'ఇమెయిల్')}</label>
            <input type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>{t('Password', 'పాస్‌వర్డ్')}</label>
            <input type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="••••••••" required />
          </div>
          <div className="form-group">
            <label>{t('Confirm Password', 'పాస్‌వర్డ్ నిర్ధారించండి')}</label>
            <input type="password" value={form.confirm}
              onChange={e => setForm({...form, confirm: e.target.value})}
              placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? t('Creating...', 'సృష్టిస్తోంది...') : t('Create Account', 'నమోదు')}
          </button>
        </form>

        <p className="auth-switch">
          {t('Already have an account?', 'ఇప్పటికే అకౌంట్ ఉందా?')}
          {' '}<Link to="/login">{t('Sign In', 'లాగిన్')}</Link>
        </p>
      </div>
    </main>
  );
};

export default SignupPage;
