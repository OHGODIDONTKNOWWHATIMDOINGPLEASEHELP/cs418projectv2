// src/pages/AdminAdvising.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdminAdvising() {
  const [rows, setRows] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api('/admin/advising')
      .then(({ records }) => setRows(records || []))
      .catch(console.error);
  }, []);

  async function decide(id, decision) {
    const message = window.prompt(`Enter feedback to send with ${decision}:`, '');
    if (message == null) return; // user cancelled
    await api(`/admin/advising/${id}/decision`, {
      method: 'PATCH',
      body: { decision, message },
    });
    setRows(prev => prev.map(r => (r._id === id ? { ...r, status: decision } : r)));
  }

  return (
    <div className="page">
      <h2>Advising Submissions</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Term</th>
            <th>Status</th>
            <th>When</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r._id}>
              <td className="clickable" onClick={() => nav(`/admin/advising/${r._id}`)}>
                {r.user?.name || r.user?.email || '—'}
              </td>
              <td>{r.currentTerm || r.lastTerm}</td>
              <td>{r.status}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                <button
                  className="btn"
                  onClick={() => decide(r._id, 'Rejected')}
                  disabled={r.status !== 'Pending'}
                >
                  Reject
                </button>
                <button
                  className="btn primary"
                  onClick={() => decide(r._id, 'Approved')}
                  disabled={r.status !== 'Pending'}
                >
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
