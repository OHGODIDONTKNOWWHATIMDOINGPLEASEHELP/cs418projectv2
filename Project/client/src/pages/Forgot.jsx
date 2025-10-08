import { useState } from 'react';
import { api } from '../api';

export default function Forgot(){
  const [email,setEmail]=useState(''); const [msg,setMsg]=useState('');
  return (
    <div>
      <h2>Reset password</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><br/>
      <button onClick={async()=>{
        try { await api('/api/auth/forgot',{method:'POST',body:{email}}); setMsg('If the email exists, we sent a reset link.'); }
        catch(e){ setMsg(e.message); }
      }}>Send reset link</button>
      <p>{msg}</p>
    </div>
  );
}
