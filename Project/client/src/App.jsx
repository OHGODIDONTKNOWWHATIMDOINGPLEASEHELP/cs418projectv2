// client/src/App.jsx
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet'; // <-- fix casing

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

// REMOVE the direct import of Profile at top
// import Profile from './pages/Profile.jsx';
const Profile = lazy(() => import('./pages/Profile.jsx')); // keep lazy

export default function App() {
  const { ready, isAuthed, profile, logout } = useAuth();
  if (!ready) return <div className="page">Loading…</div>; // never return null

  const isAdmin = profile?.roles?.includes('admin');

  return (
    <>
      <Helmet>
  {/* Classic + most compatible */}
  <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
  {/* PNG fallback (kept) */}
  <link rel="icon" type="image/png" href="/favicon.png?v=3" sizes="32x32" />
</Helmet>


      <nav className="topbar">
        <div className="left">
          <Link to="/">Home</Link>

          {/* student menu */}
          {isAuthed && !isAdmin && (
            <>
              <Link to="/advising">Advising</Link>
              <Link to="/advising/history">History</Link>
              <Link to="/profile">Profile</Link>
            </>
          )}

          {/* admin menu */}
          {isAuthed && isAdmin && (
            <>
              <Link to="/admin/advising">Admin Advising</Link>
              <Link to="/profile">Profile</Link>
            </>
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

      <Suspense fallback={<div className="page">Loading…</div>}>
        <Routes>
          {/* public */}
          <Route path="/login" element={isAuthed ? <Navigate to="/" /> : <Login />} />
          <Route path="/2fa" element={<TwoFA />} />
          <Route path="/register" element={isAuthed ? <Navigate to="/" /> : <Register />} />
          <Route path="/forgot" element={isAuthed ? <Navigate to="/" /> : <Forgot />} />
          <Route path="/reset" element={isAuthed ? <Navigate to="/" /> : <Reset />} />

          {/* profile */}
          <Route path="/profile" element={isAuthed ? <Profile /> : <Navigate to="/login" />} />

          {/* student-only advising */}
          <Route path="/advising" element={isAuthed && !isAdmin ? <AdvisingForm /> : <Navigate to="/" />} />
          <Route path="/advising/:id" element={isAuthed && !isAdmin ? <AdvisingForm /> : <Navigate to="/" />} />
          <Route path="/advising/history" element={isAuthed && !isAdmin ? <AdvisingHistory /> : <Navigate to="/" />} />
          <Route path="/home" element={isAuthed && !isAdmin ? <Home /> : <Navigate to="/" />} />

          {/* admin-only */}
          <Route path="/admin/advising" element={isAuthed && isAdmin ? <AdminAdvising /> : <Navigate to="/" />} />
          <Route path="/admin/advising/:id" element={isAuthed && isAdmin ? <AdminAdvisingView /> : <Navigate to="/" />} />

          <Route path="/" element={<div className="page">Welcome</div>} />
        </Routes>
      </Suspense>
    </>
  );
}
