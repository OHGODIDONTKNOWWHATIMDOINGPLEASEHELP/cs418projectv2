import { useEffect, useState } from 'react';
import { api } from '../api';
import useAuth from '../useAuth';
import { Navigate } from 'react-router-dom';

export default function Admin() {
  const { token, profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');

  if (!profile?.roles?.includes('admin')) return <Navigate to="/me" replace />;

  useEffect(() => {
    api('/admin/users', { token }).then(d => setUsers(d.users)).catch(e=>setMsg(e.message));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>{msg}</p>
      <table>
        <thead><tr><th>Email</th><th>Name</th><th>Verified</th><th>Roles</th><th>Created</th></tr></thead>
        <tbody>
          {users.map(u=>(
            <tr key={u._id}>
              <td>{u.email}</td>
              <td>{u.givenName} {u.familyName}</td>
              <td>{u.isVerified ? 'Yes' : 'No'}</td>
              <td>{u.roles?.join(', ')}</td>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
