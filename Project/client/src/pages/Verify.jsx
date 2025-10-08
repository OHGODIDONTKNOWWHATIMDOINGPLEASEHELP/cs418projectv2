import { useEffect, useState } from 'react';
import { api } from '../api';

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


export default function Verify() {
  const [msg, setMsg] = useState('Verifying...');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    const token = params.get('token');
    api('/auth/verify-email', { method:'POST', body:{ email, token } })
      .then(()=> setMsg('Email verified! You can now log in.'))
      .catch(e=> setMsg(e.message));
  }, []);
  return <p>{msg}</p>;
}
