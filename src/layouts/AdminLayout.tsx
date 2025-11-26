import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/users', label: 'Usuarios', icon: 'users' },
    { path: '/admin/audit', label: 'Auditoría', icon: 'document' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado */}
      <nav className="bg-[#1d4ed8] shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/admin" className="text-xl font-bold text-white">
                Administración
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white">
                {profile?.display_name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-white text-[#1d4ed8] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenedor principal */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8 max-w-[1800px] mx-auto">
          {/* Contenido principal */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Sidebar derecho con borde */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white border border-gray-300 rounded-lg p-6 min-h-[calc(100vh-8rem)]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Menú</h2>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-[#1d4ed8] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    } flex items-center px-4 py-3 text-sm rounded-lg transition-colors group`}
                  >
                    <span className={`${
                      location.pathname === item.path
                        ? 'text-[#1d4ed8]'
                        : 'text-gray-400 group-hover:text-gray-600'
                    } mr-3`}>
                      {item.icon === 'users' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </span>
                    {item.label}
                  </Link>
                ))}
                
                <div className="my-4 border-t border-gray-200"></div>
                
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <span className="text-gray-400 group-hover:text-gray-600 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </span>
                  Dashboard
                </Link>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
