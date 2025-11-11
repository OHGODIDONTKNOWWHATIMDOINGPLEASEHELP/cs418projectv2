import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      const { tempToken, userId } = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
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
      <label>Email</label>
      <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <label>Password</label>
      <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <div className="actions">
        <button className="btn" type="submit">Next</button>
        <Link to="/forgot" style={{ fontSize: '.8rem' }}>Forgot password?</Link>
      </div>
      {msg && <p className="alert error">{msg}</p>}
    </form>
  );
}
