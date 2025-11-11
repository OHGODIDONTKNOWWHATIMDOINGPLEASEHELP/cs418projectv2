import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

const LEVEL_OPTIONS = ['100', '200', '300', '400', 'Graduate'];

export default function AdvisingForm() {
  const { id } = useParams(); // undefined when /advising/new
  const nav = useNavigate();

  const [courseOptions, setCourseOptions] = useState([]);
  const [lastTerm, setLastTerm] = useState('');
  const [lastGpa, setLastGpa] = useState('');
  const [currentTerm, setCurrentTerm] = useState('');
  const [courses, setCourses] = useState([{ level: '', courseName: '' }]);
  const [status, setStatus] = useState('Pending');
  const [msg, setMsg] = useState('');
  const [lastTermCourses, setLastTermCourses] = useState([]); // for rule
  const isEdit = Boolean(id);
  const isFrozen = status === 'Approved' || status === 'Rejected';


  useEffect(() => {
  api('/courses')
    .then(({ courses }) => setCourseOptions(courses || []))
    .catch(() => setCourseOptions([]));
}, []);

  // load existing record if editing
  useEffect(() => {
    if (!id) return;
    api(`/advising/${id}`)
      .then(({ record }) => {
        setLastTerm(record.lastTerm);
        setLastGpa(record.lastGpa);
        setCurrentTerm(record.currentTerm);
        setCourses(record.courses.length ? record.courses : [{ level: '', courseName: '' }]);
        setStatus(record.status);
        // if we tracked lastTermCourses in record, set it; else derive from lastTerm
        setLastTermCourses(record.courses.map(c => c.courseName)); // simplest
      })
      .catch(console.error);
  }, [id, isEdit]);

  function updateCourse(idx, key, value) {
    setCourses(prev => prev.map((row, i) => i === idx ? { ...row, [key]: value } : row));
  }

  function addRow() {
    setCourses(prev => [...prev, { level: '', courseName: '' }]);
  }

  function removeRow(idx) {
    setCourses(prev => prev.filter((_, i) => i !== idx));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      const body = {
        lastTerm,
        lastGpa: Number(lastGpa),
        currentTerm,
        courses,
        lastTermCourses,  // send to backend so it can enforce rule
      };
      if (isEdit) {
        await api(`/advising/${id}`, { method: 'PUT', body });
      } else {
        await api('/advising', { method: 'POST', body });
      }
      nav('/advising');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>{isEdit ? 'Edit Course Advising' : 'New Course Advising'}</h2>
      {msg && <p className="alert error">{msg}</p>}

      <div className="grid-2">
        <div>
          <label>Last Term</label>
          <input className="input" value={lastTerm} onChange={e => setLastTerm(e.target.value)} disabled={isFrozen} required />
        </div>
        <div>
          <label>Last GPA</label>
          <input className="input" type="number" step="0.01" value={lastGpa} onChange={e => setLastGpa(e.target.value)} disabled={isFrozen} required />
        </div>
        <div>
          <label>Current Term</label>
          <input className="input" value={currentTerm} onChange={e => setCurrentTerm(e.target.value)} disabled={isFrozen} required />
        </div>
        <div>
          <label>Status</label>
          <input className="input" value={status} disabled readOnly />
        </div>
      </div>

      <h3 className="mt-3">Course Plan</h3>
      {courses.map((row, idx) => (
        <div key={idx} className="grid-2 mt-1">
          <div>
            <label>Level</label>
            <select className="input" value={row.level} disabled={isFrozen}
                    onChange={e => updateCourse(idx, 'level', e.target.value)}>
              <option value="">-- choose --</option>
              {LEVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
  <label>Course Name</label>
  <select
    className="input"
    value={row.courseName}
    disabled={isFrozen}
    onChange={e => updateCourse(idx, 'courseName', e.target.value)}
  >
    <option value="">-- choose --</option>
    {courseOptions.map(c => (
      <option
        key={c.code}
        value={c.code}
        disabled={lastTermCourses.includes(c.code)}
      >
        {c.code} — {c.title}
      </option>
    ))}
  </select>
</div>


          {!isFrozen && courses.length > 1 && (
            <button type="button" className="btn secondary" onClick={() => removeRow(idx)}>Remove</button>
          )}
        </div>
      ))}
      {!isFrozen && (
        <div className="mt-2">
          <button type="button" className="btn secondary" onClick={addRow}>Add Course</button>
        </div>
      )}

      {!isFrozen && (
        <div className="actions mt-3">
          <button className="btn" type="submit">Save</button>
        </div>
      )}
    </form>
  );
}
