import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: ReactNode;
  papeis?: string[];
}

export function ProtectedRoute({ children, papeis }: Props) {
  const { isAuthenticated, usuario } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (papeis && usuario && !papeis.includes(usuario.papel)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
