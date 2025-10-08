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
      const userId = sessionStorage.getItem('userId');
      if (!userId) throw new Error('Missing userId. Please log in again.');

      // If you also want to pass the temp token, you can include it here,
      // but with the current server route it’s not required:
      // const tempToken = sessionStorage.getItem('tempToken');

      const { token, user } = await api('/auth/verify-2fa', {
        method: 'POST',
        body: { userId, code }
        // If you update the server to require the temp token, you can include it in headers
        // via the api() helper by adding an Authorization header, or add it to the body.
      });

      // Persist auth for the app
      saveAuth(token, user);

      // Clean up transient login stuff
      sessionStorage.removeItem('tempToken');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('loginEmail');

      nav('/me');
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Enter 2FA code</h2>
      <input
        className="input"
        placeholder="123456"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
        autoFocus
      />
      <div className="actions">
        <button className="btn">Verify</button>
      </div>
      {msg && <p className="alert error">{msg}</p>}
    </form>
  );
}
