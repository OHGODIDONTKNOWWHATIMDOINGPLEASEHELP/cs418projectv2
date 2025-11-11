import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Verify from './pages/Verify.jsx';
import TwoFA from './pages/TwoFA.jsx';
import Forgot from './pages/Forgot.jsx';
import Reset from './pages/Reset.jsx';
import Home from './pages/Home.jsx';
import Admin from './pages/Admin.jsx';
import AdvisingHistory from './pages/AdvisingHistory.jsx';
import AdvisingForm from './pages/AdvisingForm.jsx';
import AdminAdvising from './pages/AdminAdvising.jsx';

function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  return isAuthed ? children : <Navigate to="/login" replace />;
}

function RequireGuest({ children }) {
  const { isAuthed } = useAuth();
  return !isAuthed ? children : <Navigate to="/me" replace />;
}

export default function App() {
  const { isAuthed, profile, logout } = useAuth();

  return (
    <div className="app">
      <header className="nav">
        <h3><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>CS418</Link></h3>
        <nav className="links">
          {!isAuthed && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}

          {isAuthed && (
            <>
              <NavLink to="/me">My Home</NavLink>
              <NavLink to="/advising">Advising</NavLink>
              {profile?.roles?.includes('admin') && <NavLink to="/admin">Admin</NavLink>}
              <button className="btn-link" onClick={logout} type="button">Logout</button>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <section className="panel">
          <Routes>
            <Route path="/" element={<div>Welcome</div>} />

            {/* guests only */}
            <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
            <Route path="/register" element={<RequireGuest><Register /></RequireGuest>} />
            <Route path="/forgot" element={<RequireGuest><Forgot /></RequireGuest>} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/2fa" element={<TwoFA />} />

            {/* logged in */}
            <Route path="/me" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/advising" element={<RequireAuth><AdvisingHistory /></RequireAuth>} />
            <Route path="/advising/new" element={<RequireAuth><AdvisingForm /></RequireAuth>} />
            <Route path="/advising/:id" element={<RequireAuth><AdvisingForm /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
            <Route path="/admin/advising" element={<RequireAuth><AdminAdvising /></RequireAuth>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
