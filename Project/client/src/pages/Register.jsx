import { useState } from 'react';
import { api } from '../api';

export default function Register() {
  const [form, setForm] = useState({ email:'', password:'', givenName:'', familyName:'' });
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api('/auth/register', { method:'POST', body: form });
      setMsg('Check your email for the verification link.');
    } catch (e) { setMsg(e.message); }
  }

  return (
    <form onSubmit={submit}>
      <h2>Create account</h2>
      <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
      <input placeholder="First name" value={form.givenName} onChange={e=>setForm({...form, givenName:e.target.value})}/>
      <input placeholder="Last name" value={form.familyName} onChange={e=>setForm({...form, familyName:e.target.value})}/>
      <button>Register</button>
      <p>{msg}</p>
    </form>
  );
}
