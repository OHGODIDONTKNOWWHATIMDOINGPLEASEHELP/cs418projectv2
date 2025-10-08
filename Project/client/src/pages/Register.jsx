import { useState } from 'react';
import { api } from '../api';

export default function Register(){
  const [form, setForm] = useState({ email:'', fullName:'', password:'' });
  const [msg, setMsg] = useState('');
  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/><br/>
      <input placeholder="Full name" value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))}/><br/>
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/><br/>
      <button onClick={async()=>{
        try { await api('/api/auth/register',{method:'POST',body:form}); setMsg('Check your email to verify.'); }
        catch(e){ setMsg(e.message); }
      }}>Create account</button>
      <p>{msg}</p>
    </div>
  );
}
