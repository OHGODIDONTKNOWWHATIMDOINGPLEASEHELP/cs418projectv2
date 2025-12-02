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
  const nav = useNavigate();
  const [captcha, setCaptcha] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    if (!captcha) return setMsg('Please complete reCAPTCHA.');
    try {
      const { ok, tempToken, userId } = await api('/auth/login', {
        method: 'POST',
        body: { email, password, captcha },
      });

      // ✅ store for step 2
      sessionStorage.setItem('tempToken', tempToken);
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('loginEmail', email);

      // go to 2fa screen
      nav('/2fa');
    } catch (err) {
      setMsg(err.message);
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
        />

        <label>Password</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button className="btn primary" type="submit">
          Continue
        </button>

        {msg && <p className="alert error">{msg}</p>}
        
        <ReCAPTCHA sitekey={siteKey} onChange={setCaptcha} />
      <button className="btn primary" type="submit">Continue</button>
      {msg && <p className="alert error">{msg}</p>}
      </form>
    </div>
  );
}
