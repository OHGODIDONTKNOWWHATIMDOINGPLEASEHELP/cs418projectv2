// client/src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ givenName: '', familyName: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    api('/user/me')
      .then((data) => {
        const u = data?.user || data; // accept both shapes
        setUser(u);
        setForm({ givenName: u?.givenName || '', familyName: u?.familyName || '' });
      })
      .catch((e) => setMsg(e.message || 'Failed to load profile'));
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const data = await api('/user/me', { method: 'POST', body: form });
      const u = data?.user || data;
      setUser(u);
      setMsg('Profile saved');
    } catch (e) {
      setMsg(e.message || 'Save failed');
    }
  }

  async function changePw(e) {
    e.preventDefault();
    try {
      await api('/user/change-password', { method: 'POST', body: pw });
      setPw({ currentPassword: '', newPassword: '' });
      setMsg('Password changed');
    } catch (e) {
      setMsg(e.message || 'Change failed');
    }
  }

  if (msg && !user) return <div className="page"><p className="alert error">{msg}</p></div>;
  if (!user) return <div className="page">Loading…</div>;

  return (
    <div className="page">
      <h2>My Profile</h2>
      <div className="card">
        <p><b>Email:</b> {user.email}</p>
        <form onSubmit={saveProfile} className="form">
          <label>First name</label>
          <input className="input" value={form.givenName} onChange={e => setForm({ ...form, givenName: e.target.value })} />
          <label>Last name</label>
          <input className="input" value={form.familyName} onChange={e => setForm({ ...form, familyName: e.target.value })} />
          <button className="btn primary" type="submit">Save profile</button>
        </form>
      </div>

      <h3>Change password</h3>
      <form onSubmit={changePw} className="form">
        <input className="input" type="password" placeholder="Current" value={pw.currentPassword}
               onChange={e => setPw({ ...pw, currentPassword: e.target.value })} />
        <input className="input" type="password" placeholder="New" value={pw.newPassword}
               onChange={e => setPw({ ...pw, newPassword: e.target.value })} />
        <button className="btn" type="submit">Change</button>
      </form>

      {msg && <p className="alert">{msg}</p>}
    </div>
  );
}
