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
import AdminAdvisingView from './pages/AdminAdvisingView.jsx';

function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  return isAuthed ? children : <Navigate to="/login" replace />;
}

function RequireGuest({ children }) {
  const { isAuthed } = useAuth();
  return !isAuthed ? children : <Navigate to="/me" replace />;
}

export default function App() {
  const { ready, isAuthed, profile, logout } = useAuth();
  if (!ready) return null; // or a spinner

  const isAdmin = profile?.roles?.includes("admin");

  return (
    <>
      <nav className="topbar">
  <div className="left">
    <Link to="/">Home</Link>

    {/* student menu */}
    {isAuthed && !isAdmin && (
      <>
        <Link to="/advising">Advising</Link>
        <Link to="/advising/history">History</Link>
      </>
    )}

    {/* admin menu */}
    {isAuthed && isAdmin && (
      <Link to="/admin/advising">Admin Advising</Link>
    )}
  </div>

  <div className="right">
    {isAuthed ? (
      <button onClick={logout} className="btn link">
        Logout
      </button>
    ) : (
      <>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </>
    )}
  </div>
</nav>


      <Routes>
        {/* public-ish */}
        <Route path="/login" element={isAuthed ? <Navigate to="/" /> : <Login />} />
        <Route path="/2fa" element={<TwoFA />} />
        <Route path="/register" element={isAuthed ? <Navigate to="/" /> : <Register />} />
        <Route path="/forgot" element={isAuthed ? <Navigate to="/" /> : <Forgot />} />

        {/* student-only advising */}
        <Route
          path="/advising"
          element={
            isAuthed && !isAdmin ? <AdvisingForm /> : <Navigate to="/" />
          }
        />
        <Route
          path="/advising/:id"
          element={
            isAuthed && !isAdmin ? <AdvisingForm /> : <Navigate to="/" />
          }
        />
        <Route
          path="/advising/history"
          element={
            isAuthed && !isAdmin ? <AdvisingHistory /> : <Navigate to="/" />
          }
        />
        <Route
          path="/home"
          element={
            isAuthed && !isAdmin ? <Home /> : <Navigate to="/" />
          }
        />
        <Route
          path="/reset"
          element={isAuthed ? <Navigate to="/" /> : <Reset />}
        />

        {/* admin-only advising list */}
        <Route
  path="/admin/advising"
  element={isAuthed && isAdmin ? <AdminAdvising /> : <Navigate to="/" />}
/>
<Route
  path="/admin/advising/:id"
  element={isAuthed && isAdmin ? <AdminAdvisingView /> : <Navigate to="/" />}
/>


        {/* default */}
        <Route path="/" element={<div className="page">Welcome</div>} />
      </Routes>
    </>
  );
}
