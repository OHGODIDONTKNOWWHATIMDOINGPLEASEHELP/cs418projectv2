import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext.jsx';

export default function TwoFA() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      const userId = sessionStorage.getItem('userId');
      if (!userId) throw new Error('Missing userId');

      const { token, user } = await api('/auth/verify-2fa', {
        method: 'POST',
        body: { userId, code }
      });

      login(token, user);                 // <-- persist auth globally
      sessionStorage.removeItem('tempToken');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('loginEmail');
      nav('/me');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Enter 2FA code</h2>
      <input className="input" placeholder="123456" inputMode="numeric" maxLength={6}
             value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,''))} />
      <div className="actions"><button className="btn">Verify</button></div>
      {msg && <p className="alert error">{msg}</p>}
    </form>
  );
}
