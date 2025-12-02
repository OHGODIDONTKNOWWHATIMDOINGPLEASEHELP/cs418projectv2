// src/pages/AdvisingForm.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdvisingForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const isEdit = !!id && id !== 'new' && id !== 'undefined' && id.length >= 12;

  const [lastTerm, setLastTerm] = useState('');
  const [lastGpa, setLastGpa] = useState('');
  const [currentTerm, setCurrentTerm] = useState('');
  const [lastTermCourses, setLastTermCourses] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [rows, setRows] = useState([{ level: '', courseName: '' }]);
  const [frozen, setFrozen] = useState(false);
  const [msg, setMsg] = useState('');

  // load available courses
  useEffect(() => {
    api('/courses')
      .then(({ courses }) => setCourseOptions(courses || []))
      .catch(() => setCourseOptions([]));
  }, []);

  // load record ONLY if it's a real edit id
  useEffect(() => {
    if (!isEdit) return;
    api(`/advising/${id}`)
      .then(({ record }) => {
        if (!record) return;
        setLastTerm(record.lastTerm || '');
        setLastGpa(record.lastGpa || '');
        setCurrentTerm(record.currentTerm || '');
        setLastTermCourses(record.lastTermCourses || []);
        setRows(
          record.courses?.length ? record.courses : [{ level: '', courseName: '' }]
        );
        setFrozen(record.status && record.status !== 'Pending');
      })
      .catch(err => setMsg(err.message || 'Failed to load advising record.'));
  }, [id, isEdit]);

  function updateCourse(idx, key, value) {
    setRows(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  }

  function addRow() {
    if (frozen) return;
    setRows(prev => [...prev, { level: '', courseName: '' }]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (frozen) return;

    const body = {
      lastTerm,
      lastGpa,
      currentTerm,
      courses: rows,
      lastTermCourses,
    };

    try {
      setMsg('');
      const path = isEdit ? `/advising/${id}` : '/advising';
      const method = isEdit ? 'PUT' : 'POST';
      const out = await api(path, { method, body });
      if (!out?.record?._id) {
        console.warn('Saved but missing record id:', out);
      }
      nav('/advising/history');
    } catch (err) {
      setMsg(err.message || 'Save failed.');
    }
  }

  return (
    <div className="page">
      <h2>{isEdit ? 'Edit Advising' : 'New Advising'}</h2>

      {msg && <p className="alert">{msg}</p>}
      {frozen && <p className="alert">This record is not editable.</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Last Term</label>
          <input className="input" value={lastTerm}
            onChange={e => setLastTerm(e.target.value)} disabled={frozen} />
        </div>
        <div className="form-row">
          <label>Last GPA</label>
          <input className="input" value={lastGpa}
            onChange={e => setLastGpa(e.target.value)} disabled={frozen} />
        </div>
        <div className="form-row">
          <label>Current Term</label>
          <input className="input" value={currentTerm}
            onChange={e => setCurrentTerm(e.target.value)} disabled={frozen} />
        </div>

        <div className="form-row">
          <label>Courses taken last term (codes, comma separated)</label>
          <input className="input"
            value={lastTermCourses.join(',')}
            onChange={e => setLastTermCourses(
              e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            )}
            disabled={frozen}
          />
        </div>

        <h3>Planned Courses</h3>
        {rows.map((row, idx) => (
          <div key={idx} className="course-row">
            <select className="input" value={row.level} disabled={frozen}
              onChange={e => updateCourse(idx, 'level', e.target.value)}>
              <option value="">-- level --</option>
              <option value="UG">Undergraduate</option>
              <option value="G">Graduate</option>
            </select>

            <select className="input" value={row.courseName} disabled={frozen}
              onChange={e => updateCourse(idx, 'courseName', e.target.value)}>
              <option value="">-- choose --</option>
              {courseOptions.map(c => (
                <option key={c.code} value={c.code}
                        disabled={lastTermCourses.includes(c.code)}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
        ))}

        {!frozen && (
          <>
            <button type="button" className="btn" onClick={addRow}>+ Add course</button>
            <button type="submit" className="btn primary">Save</button>
          </>
        )}
      </form>
    </div>
  );
}
