import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Verify() {
  const [msg, setMsg] = useState('Verifying...');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    const token = params.get('token');
    api('/auth/verify-email', { method:'POST', body:{ email, token } })
      .then(()=> setMsg('Email verified! You can now log in.'))
      .catch(e=> setMsg(e.message));
  }, []);
  return <p>{msg}</p>;
}
