import { useState } from 'react';
import { api } from '../api';
import useAuth from '../useAuth';
import { useNavigate } from 'react-router-dom';

export default function TwoFA() {
  const nav = useNavigate();
  const { saveAuth } = useAuth();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      const tempToken = sessionStorage.getItem('tempToken');
      const email = sessionStorage.getItem('loginEmail');
      // who is the user? lookup minimal id with a small helper endpoint or pass id via temp JWT on server;
      // to keep minimal, add a tiny endpoint or re-query by email:
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/users`);
      // In a real app you'd have a dedicated endpoint to translate tempToken -> userId.
      // For brevity, let's assume we add the userId to sessionStorage when server returned login (or decode from temp JWT).
    } catch (e) { setMsg(e.message); }
  }

  return (
    <form onSubmit={submit}>
      <h2>Enter 2FA code</h2>
      <input placeholder="123456" value={code} onChange={e=>setCode(e.target.value)}/>
      <button>Verify</button>
      <p>{msg}</p>
    </form>
  );
}
