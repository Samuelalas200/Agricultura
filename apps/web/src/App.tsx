import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/FirebaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/Toaster';
import { ErrorBoundary, PageErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy loading de páginas
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const FarmsPage = lazy(() => import('@/pages/farms/FarmsPage'));
const CropsPage = lazy(() => import('@/pages/crops/CropsPage'));
const TasksPage = lazy(() => import('@/pages/tasks/TasksPage'));
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'));
const NewInventoryItemPage = lazy(() => import('@/pages/inventory/NewInventoryItemPage'));
const InventoryDetailPage = lazy(() => import('@/pages/inventory/InventoryDetailPage'));
const EditInventoryItemPage = lazy(() => import('@/pages/inventory/EditInventoryItemPage'));
const PurchasesPage = lazy(() => import('@/pages/inventory/PurchasesPage'));
const MovementsPage = lazy(() => import('@/pages/inventory/MovementsPage'));
const ReportsPage = lazy(() => import('@/pages/inventory/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const HelpPage = lazy(() => import('@/pages/help/HelpPage'));

// Componente de Loading para Suspense
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Cargando página...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={
                <PageErrorBoundary>
                  <LoginPage />
                </PageErrorBoundary>
              } />
              <Route path="/register" element={
                <PageErrorBoundary>
                  <RegisterPage />
                </PageErrorBoundary>
              } />
              
              {/* Rutas protegidas */}
              <Route path="/" element={<ProtectedRoute />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={
                  <PageErrorBoundary>
                    <DashboardPage />
                  </PageErrorBoundary>
                } />
                <Route path="farms" element={
                  <PageErrorBoundary>
                    <FarmsPage />
                  </PageErrorBoundary>
                } />
                <Route path="crops" element={
                  <PageErrorBoundary>
                    <CropsPage />
                  </PageErrorBoundary>
                } />
                <Route path="tasks" element={
                  <PageErrorBoundary>
                    <TasksPage />
                  </PageErrorBoundary>
                } />
                <Route path="inventory" element={
                  <PageErrorBoundary>
                    <InventoryPage />
                  </PageErrorBoundary>
                } />
                <Route path="inventory/new" element={
                  <PageErrorBoundary>
                    <NewInventoryItemPage />
                  </PageErrorBoundary>
                } />
                <Route path="inventory/:id" element={
                  <PageErrorBoundary>
                    <InventoryDetailPage />
                  </PageErrorBoundary>
                } />
                <Route path="inventory/:id/edit" element={
                  <PageErrorBoundary>
                    <EditInventoryItemPage />
                  </PageErrorBoundary>
                } />
                <Route path="inventory/purchases" element={
                  <PageErrorBoundary>
                    <PurchasesPage />
                  </PageErrorBoundary>
                } />
                <Route path="inventory/purchases/new" element={
                  <PageErrorBoundary>
                    <PurchasesPage />
                  </PageErrorBoundary>
                } />
                <Route path="inventory/:id/movements" element={
                  <PageErrorBoundary>
                    <MovementsPage />
                  </PageErrorBoundary>
                } />
                <Route path="inventory/movements" element={
                  <PageErrorBoundary>
                    <MovementsPage />
                  </PageErrorBoundary>
                } />
                <Route path="inventory/reports" element={
                  <PageErrorBoundary>
                    <ReportsPage />
                  </PageErrorBoundary>
                } />
                <Route path="settings" element={
                  <PageErrorBoundary>
                    <SettingsPage />
                  </PageErrorBoundary>
                } />
                <Route path="help" element={
                  <PageErrorBoundary>
                    <HelpPage />
                  </PageErrorBoundary>
                } />
              </Route>
              
              {/* Ruta 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
          
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </div>
    </ErrorBoundary>
  );
}

export default App;
