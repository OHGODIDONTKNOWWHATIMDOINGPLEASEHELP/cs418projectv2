import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api';

export default function ProtectedRoute({ children, admin=false }) {
  const [state, setState] = useState({ loading: true, ok: false, role: null });
  useEffect(() => {
    api('/api/auth/me')
      .then(({ user }) => setState({ loading:false, ok:!!user, role:user?.role||null }))
      .catch(() => setState({ loading:false, ok:false, role:null }));
  }, []);
  if (state.loading) return <p>Loading...</p>;
  if (!state.ok) return <Navigate to="/login" replace />;
  if (admin && state.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}
