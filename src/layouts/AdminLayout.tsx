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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Blob shapes decorativos globales */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      {/* Header simplificado */}
      <nav className="bg-[#1d4ed8] shadow-lg relative z-10">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center min-w-0 flex-1">
              <Link to="/admin" className="text-base sm:text-xl font-bold text-white truncate">
                Administración
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-white truncate max-w-[80px] sm:max-w-none">
                {(profile?.display_name || user?.email || '').split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-white text-[#1d4ed8] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenedor principal */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 max-w-[1800px] mx-auto">
          {/* Sidebar móvil - horizontal en la parte superior */}
          <aside className="lg:hidden w-full">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <nav className="flex gap-2 overflow-x-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-[#1d4ed8] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    } flex items-center px-3 py-2 text-xs rounded-lg transition-colors whitespace-nowrap`}
                  >
                    <span className={`${
                      location.pathname === item.path
                        ? 'text-[#1d4ed8]'
                        : 'text-gray-400'
                    } mr-2`}>
                      {item.icon === 'users' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </span>
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/dashboard"
                  className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span className="text-gray-400 mr-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </span>
                  Dashboard
                </Link>
              </nav>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Sidebar derecho con borde - solo desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white border border-gray-300 rounded-lg p-6 min-h-[calc(100vh-8rem)] sticky top-6">
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
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
