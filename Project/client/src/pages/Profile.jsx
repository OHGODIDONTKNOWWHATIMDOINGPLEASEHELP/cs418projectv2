import { useEffect, useState } from 'react';
import { api } from '../api';
import useAuth from '../useAuth';

export default function Me() {
  const { token, profile, saveAuth } = useAuth();
  const [form, setForm] = useState({ givenName:'', familyName:'' });
  const [pw, setPw] = useState({ currentPassword:'', newPassword:'' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/user/me', { token }).then(p => {
      setForm({ givenName: p.givenName || '', familyName: p.familyName || '' });
      saveAuth(token, p);
    }).catch(e=>setMsg(e.message));
  }, []);

  async function saveProfile(e){
    e.preventDefault();
    try {
      const p = await api('/user/me', { method:'POST', body: form, token });
      saveAuth(token, p);
      setMsg('Profile saved');
    } catch(e){ setMsg(e.message); }
  }

  async function changePw(e){
    e.preventDefault();
    try { await api('/user/change-password', { method:'POST', body: pw, token });
      setMsg('Password changed');
    } catch(e){ setMsg(e.message); }
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
    <div>
      <h2>My homepage</h2>
      <p>Email (immutable): {profile?.email}</p>
      <form onSubmit={saveProfile}>
        <input value={form.givenName} onChange={e=>setForm({...form, givenName:e.target.value})}/>
        <input value={form.familyName} onChange={e=>setForm({...form, familyName:e.target.value})}/>
        <button>Save profile</button>
      </form>

      <h3>Change password</h3>
      <form onSubmit={changePw}>
        <input type="password" placeholder="Current" value={pw.currentPassword} onChange={e=>setPw({...pw, currentPassword:e.target.value})}/>
        <input type="password" placeholder="New" value={pw.newPassword} onChange={e=>setPw({...pw, newPassword:e.target.value})}/>
        <button>Change</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
