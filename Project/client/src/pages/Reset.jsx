import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api';

export default function Reset(){
  const [sp]=useSearchParams(); const token=sp.get('token')||'';
  const [password,setPassword]=useState(''); const [msg,setMsg]=useState('');
  return (
    <div>
      <h2>Set a new password</h2>
      <input type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)}/><br/>
      <button onClick={async()=>{
        try { await api('/api/auth/reset',{method:'POST',body:{token,password}}); setMsg('Password updated. You can log in now.'); }
        catch(e){ setMsg(e.message); }
      }}>Update</button>
      <p>{msg}</p>
    </div>
  );
}
