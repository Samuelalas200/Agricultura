import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/FirebaseAuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/Toaster';

// Páginas
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import FarmsPage from '@/pages/farms/FarmsPage';
import CropsPage from '@/pages/crops/CropsPage';
import TasksPage from '@/pages/tasks/TasksPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Rutas protegidas */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="farms" element={<FarmsPage />} />
            <Route path="crops" element={<CropsPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
          
          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        <Toaster />
      </AuthProvider>
    </div>
  );
}

export default App;
