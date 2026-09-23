import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { FornecedoresPage } from './pages/admin/FornecedoresPage';
import { GruposPage } from './pages/admin/GruposPage';
import { LocaisPage } from './pages/admin/LocaisPage';
import { MotivosDescartePage } from './pages/admin/MotivosDescartePage';
import { ProdutosPage } from './pages/admin/ProdutosPage';
import { AjustesPendentesPage } from './pages/AjustesPendentesPage';
import { ConsultaLotePage } from './pages/ConsultaLotePage';
import { ConsumoPage } from './pages/ConsumoPage';
import { ContagemPage } from './pages/ContagemPage';
import { DashboardPage } from './pages/DashboardPage';
import { DescartePage } from './pages/DescartePage';
import { LoginPage } from './pages/LoginPage';
import { LoteDetalhePage } from './pages/LoteDetalhePage';
import { LotePage } from './pages/LotePage';
import { ProducaoPage } from './pages/ProducaoPage';
import { RecebimentoPage } from './pages/RecebimentoPage';
import { TransferenciaEnviarPage } from './pages/TransferenciaEnviarPage';
import { TransferenciaReceberPage } from './pages/TransferenciaReceberPage';

export function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        path="/l/:qrCodeId"
        element={
          <ProtectedRoute>
            <Layout>
              <LotePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lotes"
        element={
          <ProtectedRoute>
            <Layout>
              <ConsultaLotePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lotes/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <LoteDetalhePage />
            </Layout>
          </ProtectedRoute>
        }
      />
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
        path="/producao"
        element={
          <ProtectedRoute>
            <Layout>
              <ProducaoPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transferencias/enviar"
        element={
          <ProtectedRoute>
            <Layout>
              <TransferenciaEnviarPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transferencias/receber"
        element={
          <ProtectedRoute>
            <Layout>
              <TransferenciaReceberPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/descarte"
        element={
          <ProtectedRoute>
            <Layout>
              <DescartePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/consumo"
        element={
          <ProtectedRoute>
            <Layout>
              <ConsumoPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contagem"
        element={
          <ProtectedRoute>
            <Layout>
              <ContagemPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ajustes-pendentes"
        element={
          <ProtectedRoute>
            <Layout>
              <AjustesPendentesPage />
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
      <Route
        path="/admin/locais"
        element={
          <ProtectedRoute papeis={['ADMIN']}>
            <Layout>
              <LocaisPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grupos"
        element={
          <ProtectedRoute papeis={['ADMIN']}>
            <Layout>
              <GruposPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fornecedores"
        element={
          <ProtectedRoute papeis={['ADMIN']}>
            <Layout>
              <FornecedoresPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/motivos-descarte"
        element={
          <ProtectedRoute papeis={['ADMIN']}>
            <Layout>
              <MotivosDescartePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
