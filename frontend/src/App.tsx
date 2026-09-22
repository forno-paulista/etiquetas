import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { ProdutosPage } from './pages/admin/ProdutosPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { LotePublicoPage } from './pages/LotePublicoPage';
import { RecebimentoPage } from './pages/RecebimentoPage';

export function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/l/:qrCodeId" element={<LotePublicoPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recebimento"
        element={
          <ProtectedRoute>
            <Layout>
              <RecebimentoPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/produtos"
        element={
          <ProtectedRoute papeis={['ADMIN']}>
            <Layout>
              <ProdutosPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
