import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdvisingHistory() {
  const [records, setRecords] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api('/advising')
      .then(({ records }) => setRecords(records || []))
      .catch(() => setRecords([]));
  }, []);

  return (
    <div className="page">
      <h2>Course Advising History</h2>
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
            {records.map(r => (
              <tr key={r._id} onClick={() => nav(`/advising/${r._id}`)} className="clickable">
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>{r.currentTerm || r.lastTerm}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
