// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import ReCAPTCHA from 'react-google-recaptcha';

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg('');

    if (!siteKey) {
      setMsg('reCAPTCHA is not configured.');
      return;
    }
    if (!captcha) {
      setMsg('Please complete reCAPTCHA.');
      return;
    }

    try {
      setBusy(true);
      const { tempToken, userId } = await api('/auth/login', {
        method: 'POST',
        body: { email, password, captcha },
      });

      sessionStorage.setItem('tempToken', tempToken);
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('loginEmail', email);

      nav('/2fa');
    } catch (err) {
      // if captcha token expired, prompt user to redo it
      setMsg(err.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <h2>Login</h2>

        <label>Email</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        <label>Password</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {/* Put reCAPTCHA before the submit, and only render if configured */}
        {siteKey ? (
          <ReCAPTCHA
            sitekey={siteKey}
            onChange={token => setCaptcha(token || '')}
            onExpired={() => setCaptcha('')}
          />
        ) : (
          <p className="alert">reCAPTCHA not configured.</p>
        )}

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'Working…' : 'Continue'}
        </button>

        {msg && <p className="alert error">{msg}</p>}
      </form>
    </div>
  );
}
