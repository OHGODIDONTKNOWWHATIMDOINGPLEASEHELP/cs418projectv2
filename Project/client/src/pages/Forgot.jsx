import { useState } from 'react';
import { api } from '../api';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  async function submit(e) {
    e.preventDefault();
    try { await api('/auth/request-password-reset', { method:'POST', body:{ email } });
      setMsg('If the email exists, a reset link has been sent.'); }
    catch (e) { setMsg(e.message); }
  }

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

  return (
    <form onSubmit={submit}>
      <h2>Reset password</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <button>Send link</button>
      <p>{msg}</p>
    </form>
  );
}
