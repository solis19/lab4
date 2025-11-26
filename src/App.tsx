import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Páginas públicas
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { SurveyPublic } from './pages/SurveyPublic';

// Páginas protegidas (creator)
import { Dashboard } from './pages/Dashboard';
import { SurveyBuilder } from './pages/SurveyBuilder';
import { SurveyDetails } from './pages/SurveyDetails';
import { SurveyResults } from './pages/SurveyResults';

// Páginas de administración
import { Users } from './pages/admin/Users';
import { Roles } from './pages/admin/Roles';
import { AuditLogPage } from './pages/admin/AuditLog';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/s/:publicSlug" element={<SurveyPublic />} />

            {/* Rutas protegidas - Creator */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/surveys/new"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SurveyBuilder />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/surveys/:id/edit"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SurveyBuilder />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/surveys/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SurveyDetails />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/surveys/:id/results"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SurveyResults />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Rutas de administración */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/users" replace />}
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Users />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Roles />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AuditLogPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

