import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import qrImage from '../assets/image-QR.png';

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
      {/* Blob shapes decorativos globales */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      <nav className="bg-[#1d4ed8] shadow-lg relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                {/* QR decorativo antes del título */}
                <div className="opacity-80 transform rotate-12 hidden xs:block">
                  <img 
                    src={qrImage} 
                    alt="QR decorativo" 
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white p-1 rounded"
                  />
                </div>
                <Link to="/dashboard" className="text-base sm:text-xl font-bold text-white truncate">
                  EncuestasQR
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
};

