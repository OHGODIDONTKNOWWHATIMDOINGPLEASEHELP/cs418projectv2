import { useEffect, useState } from 'react';
import { api } from '../api';

export default function AdminAdvising() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api('/admin/advising')
      .then(({ records }) => setRows(records || []))
      .catch(console.error);
  }, []);

  async function approve(id) {
    await api(`/admin/advising/${id}/approve`, { method: 'PATCH' });
    setRows(prev => prev.map(r => (r._id === id ? { ...r, status: 'Approved' } : r)));
  }

  async function reject(id) {
    await api(`/admin/advising/${id}/reject`, { method: 'PATCH' });
    setRows(prev => prev.map(r => (r._id === id ? { ...r, status: 'Rejected' } : r)));
  }

  return (
    <div className="page">
      <h2>Advising Submissions</h2>
      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Term</th>
            <th>Status</th>
            <th>When</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r._id}>
              <td>{r.user?.email || '—'}</td>
              <td>{r.currentTerm || r.lastTerm}</td>
              <td>{r.status}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                <button
                  className="btn"
                  onClick={() => approve(r._id)}
                  disabled={r.status !== 'Pending'}
                >
                  Approve
                </button>
                <button
                  className="btn"
                  onClick={() => reject(r._id)}
                  disabled={r.status !== 'Pending'}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
