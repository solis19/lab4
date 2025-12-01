import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../lib/supabaseClient';

export const Profile = () => {
  const { user, profile, role, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        display_name: profile.display_name || '',
        email: user?.email || '',
      }));
    }
  }, [profile, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!user) throw new Error('Usuario no autenticado');

      // Actualizar nombre de usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: formData.display_name })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        throw new Error('Por favor completa todos los campos de contraseña');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Las contraseñas nuevas no coinciden');
      }

      if (formData.newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      if (!user?.email) {
        throw new Error('No se pudo obtener el email del usuario');
      }

      // Re-autenticar con la contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword,
      });

      if (signInError) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Blob shapes decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/3 -left-48 w-[550px] h-[550px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-2/3 right-1/3 w-[450px] h-[450px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>

          {/* Mensajes */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Información de la cuenta */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cuenta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  El correo electrónico no se puede modificar
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <Input
                  type="text"
                  value={role === 'admin' ? 'Administrador' : role === 'creator' ? 'Creador' : 'Usuario'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Actualizar perfil */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Usuario
                </label>
                <Input
                  id="display_name"
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>

          {/* Cambiar contraseña */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Tu contraseña actual"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repite la nueva contraseña"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} variant="outline">
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

