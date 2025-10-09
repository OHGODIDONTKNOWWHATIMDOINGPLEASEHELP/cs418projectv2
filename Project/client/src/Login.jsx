// client/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');

    try {
      // ⬇️ THIS is where that line goes:
      const { tempToken, userId } = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      // save temp login info for 2FA step
      sessionStorage.setItem('tempToken', tempToken);
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('loginEmail', email);

      nav('/2fa');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      <input
        className="input"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
      <input
        className="input"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      <div className="actions">
        <button className="btn" type="submit">Next</button>
      </div>
      {msg && <p className="alert error">{msg}</p>}
    </form>
  );
}
