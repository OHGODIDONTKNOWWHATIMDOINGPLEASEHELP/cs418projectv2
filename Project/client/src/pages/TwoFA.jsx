// src/pages/TwoFA.jsx
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function TwoFA() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      const tempToken = sessionStorage.getItem('tempToken');
      const userId = sessionStorage.getItem('userId');

      const { token, user } = await api('/auth/verify-2fa', {
        method: 'POST',
        body: { code, tempToken, userId },
      });
      const { login } = useAuth();
login(token, user);


      // 👇 THIS is what advising will later use
      localStorage.setItem('token', token);

      // optional: store user too
      localStorage.setItem('user', JSON.stringify(user));

      nav('/advising');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <input value={code} onChange={e => setCode(e.target.value)} />
      <button>Verify</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
