import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await signIn(email, password);
    if (error) { setError(error.message); setLoading(false); }
    else navigate('/');
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-main">{t('Bhumi', 'భూమి')}</span>
            <span className="logo-sub">{t('Old School Foods', 'ఓల్డ్ స్కూల్ ఫుడ్స్')}</span>
          </Link>
          <div className="divider" />
          <h1 className="auth-title">{t('Sign In', 'లాగిన్')}</h1>
          <p className="auth-sub">{t('Welcome back to Bhumi', 'భూమికి స్వాగతం')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('Email', 'ఇమెయిల్')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>{t('Password', 'పాస్‌వర్డ్')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? t('Signing in...', 'లాగిన్ అవుతోంది...') : t('Sign In', 'లాగిన్')}
          </button>
        </form>

        <p className="auth-switch">
          {t("Don't have an account?", "అకౌంట్ లేదా?")}
          {' '}<Link to="/signup">{t('Sign Up', 'నమోదు')}</Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
