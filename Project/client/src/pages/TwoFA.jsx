import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function TwoFA(){
  const [code,setCode]=useState(''); const [msg,setMsg]=useState(''); const nav=useNavigate();
  return (
    <div>
      <h2>Enter 2FA code</h2>
      <input placeholder="6-digit code" value={code} maxLength={6} onChange={e=>setCode(e.target.value)}/><br/>
      <button onClick={async()=>{
        try { const { role } = await api('/api/auth/twofa',{method:'POST',body:{code}}); nav(role==='ADMIN'?'/admin':'/profile'); }
        catch(e){ setMsg(e.message); }
      }}>Verify</button>
      <p>{msg}</p>
    </div>
  );
}
