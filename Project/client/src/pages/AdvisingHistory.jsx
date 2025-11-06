import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdvisingHistory() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    api('/advising')
      .then(data => setRows(data.records || []))
      .catch(e => setMsg(e.message));
  }, []);

  return (
    <div>
      <h2>Course Advising History</h2>
      <div className="actions">
        <button className="btn" onClick={() => nav('/advising/new')}>New Advising Form</button>
      </div>
      {msg && <p className="alert error">{msg}</p>}
      {rows.length === 0 ? (
        <p>No records.</p>
      ) : (
        <div className="table-wrap mt-2">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Term</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} onClick={() => nav(`/advising/${r.id}`)} style={{ cursor: 'pointer' }}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.term}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
