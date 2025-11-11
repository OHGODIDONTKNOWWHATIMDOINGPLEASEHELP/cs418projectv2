import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext.jsx'; // 👈 THIS was missing

export default function TwoFA() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [email, setEmail] = useState('');
  const nav = useNavigate();
  const { login } = useAuth();              // 👈 now it's defined

  useEffect(() => {
    const e = sessionStorage.getItem('loginEmail');
    if (e) setEmail(e);
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg('');

    const tempToken = sessionStorage.getItem('tempToken');
    const userId = sessionStorage.getItem('userId');

    if (!tempToken || !userId) {
      setMsg('Session expired, please log in again.');
      return nav('/login');
    }

    try {
      const { token, user } = await api('/auth/verify-2fa', {
        method: 'POST',
        body: { code, tempToken, userId },
      });

      // update global auth AND persist token
      login(token, user);
      localStorage.setItem('token', token);

      // clean up temp values
      sessionStorage.removeItem('tempToken');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('loginEmail');

      nav('/advising');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <h2>Two-Factor</h2>
        {email && <p className="muted">Code sent to: {email}</p>}

        <label>Enter 6-digit code</label>
        <input
          className="input"
          value={code}
          onChange={e => setCode(e.target.value)}
          maxLength={6}
          required
        />

        <button className="btn primary" type="submit">
          Verify
        </button>

        {msg && <p className="alert error">{msg}</p>}
      </form>
    </div>
  );
}
