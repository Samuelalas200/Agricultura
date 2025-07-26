import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/FirebaseAuthContext';
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
      <div className="min-h-screen bg-gray-50">
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
              </Route>
              
              {/* Ruta 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
          
          <Toaster />
        </AuthProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;
