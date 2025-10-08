// client/src/App.jsx
import { Link, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Verify from './pages/Verify.jsx';
import Login from './pages/Login.jsx';
import TwoFA from './pages/TwoFA.jsx';
import Forgot from './pages/Forgot.jsx';
import Reset from './pages/Reset.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <nav style={{ marginBottom: 16 }}>
        <Link to="/">Home</Link> | <Link to="/register">Register</Link> |
        {' '}<Link to="/login">Login</Link> | <Link to="/profile">Profile</Link> |
        {' '}<Link to="/admin">Admin</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/verify" element={<Verify/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/twofa" element={<TwoFA/>} />
          <Route path="/forgot" element={<Forgot/>} />
          <Route path="/reset" element={<Reset/>} />
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute admin><Admin/></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
