import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Verify from './pages/Verify.jsx';
import TwoFA from './pages/TwoFA.jsx';
import Forgot from './pages/Forgot.jsx';
import Reset from './pages/Reset.jsx';
import Me from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';

function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  return isAuthed ? children : <Navigate to="/login" replace />;
}
function RequireGuest({ children }) {
  const { isAuthed } = useAuth();
  return !isAuthed ? children : <Navigate to="/me" replace />;
}

function Home() { return <div><h2>Welcome 👋</h2></div>; }

export default function App() {
  const { isAuthed, profile, logout } = useAuth();

  return (
    <div className="app">
      <header className="nav">
        <h3><Link to="/">CS418</Link></h3>
        <nav className="links">
          {!isAuthed && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
          {isAuthed && (
            <>
              <NavLink to="/Profile">My Profile</NavLink>
              {profile?.roles?.includes('admin') && <NavLink to="/admin">Admin</NavLink>}
              <button className="btn secondary" onClick={logout} type="button">Logout</button>
            </>
          )}
          {/* Intentionally NO nav links for /verify, /2fa, /reset, /forgot */}
        </nav>
      </header>

      <main className="container">
        <section className="panel fade-in">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Guests only */}
            <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
            <Route path="/register" element={<RequireGuest><Register /></RequireGuest>} />

            {/* Public utility routes (linked from emails) */}
            <Route path="/verify" element={<Verify />} />
            <Route path="/2fa" element={<TwoFA />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />

            {/* Auth-only */}
            <Route path="/Profile" element={<RequireAuth><Me /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
