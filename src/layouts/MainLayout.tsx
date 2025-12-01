import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Blob shapes decorativos globales más grandes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-15 z-0">
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-[650px] h-[650px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      <nav className="bg-[#1d4ed8] shadow-lg relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                {/* Ícono QR decorativo inclinado antes del título */}
                <div className="transform -rotate-12 bg-white p-1.5 rounded-md shadow-md">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#1d4ed8]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm-2 8h8v8H3v-8zm2 2v4h4v-4H5zm8-12v8h8V3h-8zm2 2h4v4h-4V5zm0 8h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v4h-2v-4zm0 6h2v2h-2v-2z"/>
                  </svg>
                </div>
                <Link to="/dashboard" className="text-base sm:text-xl font-bold text-white truncate">
                  Surveys QR
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/dashboard"
                  className="border-white text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="border-transparent text-blue-100 hover:border-blue-200 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
              </div>
              {/* Menú móvil - Solo Admin */}
              {role === 'admin' && (
                <div className="flex md:hidden ml-2">
                  <Link
                    to="/admin"
                    className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors"
                  >
                    Admin
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/profile"
                className="text-xs sm:text-sm text-white hover:text-blue-100 transition-colors truncate max-w-[80px] sm:max-w-none flex items-center gap-1 group"
              >
                <svg className="w-4 h-4 opacity-80 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="underline decoration-transparent group-hover:decoration-white transition-all">
                  {profile?.display_name || (user?.email ? user.email.split('@')[0] : '')}
                </span>
              </Link>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
};

