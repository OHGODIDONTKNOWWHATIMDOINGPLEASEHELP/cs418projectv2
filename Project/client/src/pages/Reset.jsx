import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Reset() {
  const [msg, setMsg] = useState('');
  const [pwd, setPwd] = useState('');
  const [email, setEmail] = useState(''); const [token, setToken] = useState('');
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setEmail(p.get('email') || ''); setToken(p.get('token') || '');
  }, []);

  <div className="app">
  <header className="nav">
    <h3>CS418</h3>
    <nav className="links">
      <a href="/login">Login</a>
      <a href="/register">Register</a>
      <a href="/me">Home</a>
      <a href="/admin">Admin</a>
    </nav>
  </header>

  <main className="container">
    <section className="panel fade-in">
      {/* page-specific content here */}
    </section>
  </main>
</div>

  async function submit(e){ e.preventDefault();
    try { await api('/auth/reset-password', { method:'POST', body:{ email, token, newPassword: pwd }});
      setMsg('Password updated. You may log in.');
    } catch(e){ setMsg(e.message); }
  }
  return (<form onSubmit={submit}>
    <h2>Set new password</h2>
    <input type="password" placeholder="New password" value={pwd} onChange={e=>setPwd(e.target.value)}/>
    <button>Change</button><p>{msg}</p>
  </form>);
}
