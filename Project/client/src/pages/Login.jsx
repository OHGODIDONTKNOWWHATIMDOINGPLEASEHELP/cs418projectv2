import { useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [msg, setMsg] = useState('');

  async function submit(e) {
  e.preventDefault();
  setMsg('');
  try {
    const { tempToken, userId } = await api('/auth/login', { method:'POST', body: form });
    sessionStorage.setItem('tempToken', tempToken);
    sessionStorage.setItem('userId', userId);           // <-- add this line
    sessionStorage.setItem('loginEmail', form.email);
    // Server has emailed the 2FA code
    nav('/2fa');
  } catch (e) {
    setMsg(e.message);
  }
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
      <h2>Login</h2>
      <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
      <button>Next</button>
      <p>{msg}</p>
    </form>
  );
}
