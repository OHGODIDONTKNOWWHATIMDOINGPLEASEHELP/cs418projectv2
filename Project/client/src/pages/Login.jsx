import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [msg,setMsg]=useState(''); const nav=useNavigate();
  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><br/>
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><br/>
      <button onClick={async()=>{
        try { await api('/api/auth/login',{method:'POST',body:{email,password}}); nav('/twofa'); }
        catch(e){ setMsg(e.message); }
      }}>Continue</button>
      <p><Link to="/forgot">Forgot password?</Link></p>
      <p>{msg}</p>
    </div>
  );
}
