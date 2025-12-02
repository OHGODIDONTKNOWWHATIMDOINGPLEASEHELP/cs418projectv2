import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdvisingHistory() {
  const [records, setRecords] = useState([]);
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    api('/advising')
      .then((data) => {
        // Accept several shapes safely
        const recs =
          Array.isArray(data) ? data :
          Array.isArray(data?.records) ? data.records :
          Array.isArray(data?.list) ? data.list :
          [];
        setRecords(recs);
        if (!recs.length) setMsg(data?.error || '');
      })
      .catch((err) => {
        setMsg(err.message || 'Failed to load advising history');
        setRecords([]);
      });
  }, []);

  return (
    <div className="page">
      <h2>Course Advising History</h2>

      {msg && <p className="alert">{msg}</p>}

      {records.length === 0 ? (
        <p>No records yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Term</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                key={r._id}
                onClick={() => nav(`/advising/${r._id}`)}
                className="clickable"
              >
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                <td>{r.currentTerm || r.lastTerm || '—'}</td>
                <td>{r.status || 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
