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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#1d4ed8] shadow-lg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between h-20">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-3">
                {/* QR decorativo antes del título */}
                <div className="opacity-80 transform rotate-12">
                  <img 
                    src={qrImage} 
                    alt="QR decorativo" 
                    className="w-10 h-10 bg-white p-1 rounded"
                  />
                </div>
                <Link to="/dashboard" className="text-xl font-bold text-white">
                  EncuestasQR
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
                    Administración
                  </Link>
                )}
              </div>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

