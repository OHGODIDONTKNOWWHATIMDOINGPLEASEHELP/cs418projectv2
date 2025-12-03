// src/pages/AdminAdvisingView.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdminAdvisingView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [rec, setRec] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api(`/admin/advising/${id}`)
      .then(({ record }) => setRec(record))
      .catch(e => setErr(e.message || 'Failed to load record'));
  }, [id]);

  async function decide(decision) {
    try {
      await api(`/admin/advising/${id}/decision`, {
        method: 'PATCH',
        body: { decision, message: msg },
      });
      nav('/admin/advising');
    } catch (e) {
      setErr(e.message || 'Decision failed');
    }
  }

  if (!rec) return err ? <div className="page"><p className="alert">{err}</p></div> : null;

  return (
    <div className="page">
      <h2>{rec.user?.email || 'Student'} — {rec.currentTerm || rec.lastTerm || ''}</h2>

      {/* render fields/courses as you like ... */}

      <label>Feedback to student</label>
      <textarea
        className="input"
        placeholder="Type your message..."
        value={msg}
        onChange={e => setMsg(e.target.value)}
      />

      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <button className="btn" onClick={() => decide('Rejected')}>Reject</button>
        <button className="btn primary" onClick={() => decide('Approved')}>Approve</button>
      </div>

      {err && <p className="alert">{err}</p>}
    </div>
  );
}
