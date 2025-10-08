import { Routes, Route, Link, NavLink } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Verify from './pages/Verify.jsx';
import TwoFA from './pages/TwoFA.jsx';
import Forgot from './pages/Forgot.jsx';
import Reset from './pages/Reset.jsx';
import Me from './pages/Home.jsx';
import Admin from './pages/Admin.jsx';

function Home() {
  return (
    <div>
      <h2>Welcome 👋</h2>
      <p>Use the nav to Register or Login.</p>
    </div>
  );
}

function NotFound() {
  return <h2>404 — Not Found</h2>;
}

export default function App() {
  return (
    <div className="app">
      <header className="nav">
        <h3><Link to="/">CS418</Link></h3>
        <nav className="links">
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/me">Home</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </header>

      <main className="container">
        <section className="panel fade-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/2fa" element={<TwoFA />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/me" element={<Me />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
