import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Profile(){
  const [p,setP]=useState(null);
  const [fullName,setFullName]=useState('');
  const [msg,setMsg]=useState('');
  const [cp,setCP]=useState({current:'',next:''});

  useEffect(()=>{ (async()=> {
    const data = await api('/api/me/profile');
    setP(data); setFullName(data.fullName||'');
  })(); }, []);

  if (!p) return <p>Loading...</p>;
  return (
    <div>
      <h2>Your profile</h2>
      <p><b>Email:</b> {p.email} (cannot be changed)</p>
      <p><b>Role:</b> {p.role}</p>
      <p><b>Verified:</b> {p.verified?'Yes':'No'}</p>

      <h3>Update name</h3>
      <input value={fullName} onChange={e=>setFullName(e.target.value)} />
      <button onClick={async()=>{ await api('/api/me/profile',{method:'POST',body:{fullName}}); setMsg('Profile updated'); }}>Save</button>

      <h3>Change password</h3>
      <input type="password" placeholder="Current" value={cp.current} onChange={e=>setCP(s=>({...s,current:e.target.value}))}/><br/>
      <input type="password" placeholder="New" value={cp.next} onChange={e=>setCP(s=>({...s,next:e.target.value}))}/><br/>
      <button onClick={async()=>{
        try { await api('/api/me/change-password',{method:'POST',body:{current:cp.current,next:cp.next}}); setMsg('Password changed'); setCP({current:'',next:''}); }
        catch(e){ setMsg(e.message); }
      }}>Change</button>

      <h3>Session</h3>
      <button onClick={async()=>{ await api('/api/auth/logout',{method:'POST'}); window.location.href='/login'; }}>Log out</button>

      <p>{msg}</p>
    </div>
  );
}
