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
      const { tempToken } = await api('/auth/login', { method:'POST', body: form });
      sessionStorage.setItem('tempToken', tempToken);
      sessionStorage.setItem('loginEmail', form.email);
      // server also sent a 2FA code via email
      nav('/2fa');
    } catch (e) { setMsg(e.message); }
  }

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
