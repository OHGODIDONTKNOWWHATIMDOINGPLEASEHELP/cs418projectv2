import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Admin(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ api('/api/admin/users').then(d=>setRows(d.users)); },[]);
  return (
    <div>
      <h2>Admin dashboard</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>ID</th><th>Email</th><th>Name</th><th>Role</th><th>Verified</th><th>Joined</th></tr></thead>
        <tbody>
          {rows.map(u=>(
            <tr key={u.id}>
              <td>{u.id}</td><td>{u.email}</td><td>{u.fullName||''}</td><td>{u.role}</td>
              <td>{u.emailVerifiedAt ? 'Yes' : 'No'}</td>
              <td>{new Date(u.createdAt).toISOString().slice(0,19).replace('T',' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
