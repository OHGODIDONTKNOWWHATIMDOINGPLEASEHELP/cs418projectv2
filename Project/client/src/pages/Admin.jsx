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

  <div className="app">
  <header className="nav">
    <h3>CS418</h3>
    <nav className="links">
      <a href="/login">Login</a>
      <a href="/register">Register</a>
      <a href="/me">Home</a>
      <a href="/admin">Admin</a>
    </nav>
  </header>

  <main className="container">
    <section className="panel fade-in">
      {/* page-specific content here */}
    </section>
  </main>
</div>


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
