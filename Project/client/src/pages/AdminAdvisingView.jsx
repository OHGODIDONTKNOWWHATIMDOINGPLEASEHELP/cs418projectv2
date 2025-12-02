import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdminAdvisingView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [rec, setRec] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api(`/advising/${id}`).then(({ record }) => setRec(record));
  }, [id]);

  async function decide(decision) {
    await api(`/admin/advising/${id}/decision`, {
      method: 'PATCH',
      body: { decision, message: msg },
    });
    nav('/admin/advising'); // back to list, which will show new status
  }

  if (!rec) return null;
  return (
    <div className="page">
      <h2>{rec.user?.email} — {rec.currentTerm}</h2>
      {/* render rec fields / courses here */}
      <textarea
        className="input"
        placeholder="Feedback to student"
        value={msg}
        onChange={e => setMsg(e.target.value)}
      />
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <button className="btn" onClick={() => decide('Rejected')}>Reject</button>
        <button className="btn primary" onClick={() => decide('Approved')}>Approve</button>
      </div>
    </div>
  );
}
