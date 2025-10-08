import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';

export default function Verify(){
  const [sp] = useSearchParams();
  const token = sp.get('token') || '';
  const [msg,setMsg]=useState('Verifying...');
  useEffect(()=>{ (async()=>{
    try { await api('/api/auth/verify',{method:'POST',body:{token}}); setMsg('Email verified! You can now log in.'); }
    catch(e){ setMsg(e.message); }
  })(); },[token]);
  return <p>{msg}</p>;
}
