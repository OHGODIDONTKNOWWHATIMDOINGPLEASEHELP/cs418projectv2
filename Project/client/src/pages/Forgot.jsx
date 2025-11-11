import { useState } from 'react';
import { api } from '../api';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api('/auth/request-password-reset', {
        method: 'POST',
        body: { email }
      });
      setMsg('If that email is registered, a reset link was sent.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Forgot Password</h2>
      <p>Enter your email and we’ll send a reset link.</p>
      <label>Email</label>
      <input
        className="input"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <div className="actions">
        <button className="btn" type="submit">Send reset link</button>
      </div>
      {msg && <p className="alert">{msg}</p>}
    </form>
  );
}
