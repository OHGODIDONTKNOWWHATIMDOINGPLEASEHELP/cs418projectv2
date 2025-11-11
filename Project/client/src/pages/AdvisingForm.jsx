import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdvisingForm() {
  const { id } = useParams(); // if present, we are editing
  const nav = useNavigate();
  const [lastTerm, setLastTerm] = useState('');
  const [lastGpa, setLastGpa] = useState('');
  const [currentTerm, setCurrentTerm] = useState('');
  const [lastTermCourses, setLastTermCourses] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [rows, setRows] = useState([{ level: '', courseName: '' }]);
  const [frozen, setFrozen] = useState(false);

  // load available courses
  useEffect(() => {
    api('/courses')
      .then(({ courses }) => setCourseOptions(courses || []))
      .catch(() => setCourseOptions([]));
  }, []);

  // if editing, load that advising record
  useEffect(() => {
  if (!id) return;
  api(`/advising/${id}`)
    .then(({ record }) => {
      if (!record) return; // 👈 don't blow up

      setLastTerm(record.lastTerm || '');
      setLastGpa(record.lastGpa || '');
      setCurrentTerm(record.currentTerm || '');
      setLastTermCourses(record.lastTermCourses || []);
      setRows(
        record.courses && record.courses.length
          ? record.courses
          : [{ level: '', courseName: '' }]
      );
      setFrozen(record.status && record.status !== 'Pending');
    })
    .catch(err => {
      console.error(err);
    });
}, [id]);


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
    if (frozen) return; // can't edit approved/rejected

    const body = {
      lastTerm,
      lastGpa,
      currentTerm,
      courses: rows,
      lastTermCourses,
    };

    await api(id ? `/advising/${id}` : '/advising', {
      method: id ? 'PUT' : 'POST',
      body,
    });

    nav('/advising/history'); // or wherever your history lives
  }

  return (
    <div className="page">
      <h2>{id ? 'Edit Advising' : 'New Advising'}</h2>
      {frozen && <p className="alert">This record is { /* Approved/Rejected shown below */ }</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Last Term</label>
          <input className="input" value={lastTerm} onChange={e => setLastTerm(e.target.value)} disabled={frozen} />
        </div>
        <div className="form-row">
          <label>Last GPA</label>
          <input className="input" value={lastGpa} onChange={e => setLastGpa(e.target.value)} disabled={frozen} />
        </div>
        <div className="form-row">
          <label>Current Term</label>
          <input className="input" value={currentTerm} onChange={e => setCurrentTerm(e.target.value)} disabled={frozen} />
        </div>

        {/* maybe a text input for lastTermCourses (comma separated) */}
        <div className="form-row">
          <label>Courses taken last term (codes, comma separated)</label>
          <input
            className="input"
            value={lastTermCourses.join(',')}
            onChange={e => setLastTermCourses(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            disabled={frozen}
          />
        </div>

        <h3>Planned Courses</h3>
        {rows.map((row, idx) => (
          <div key={idx} className="course-row">
            <select
              className="input"
              value={row.level}
              disabled={frozen}
              onChange={e => updateCourse(idx, 'level', e.target.value)}
            >
              <option value="">-- level --</option>
              <option value="UG">Undergraduate</option>
              <option value="G">Graduate</option>
            </select>

            <select
              className="input"
              value={row.courseName}
              disabled={frozen}
              onChange={e => updateCourse(idx, 'courseName', e.target.value)}
            >
              <option value="">-- choose --</option>
              {courseOptions.map(c => (
                <option key={c.code} value={c.code} disabled={lastTermCourses.includes(c.code)}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
        ))}

        {!frozen && (
          <button type="button" className="btn" onClick={addRow}>
            + Add course
          </button>
        )}

        {!frozen && (
          <button type="submit" className="btn primary">
            Save
          </button>
        )}
      </form>
    </div>
  );
}
