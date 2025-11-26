import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Registrar usuario
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Crear perfil (usar upsert por si ya existe)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            display_name: displayName || null,
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('Error creando perfil:', profileError);
          // No lanzar error, el trigger de BD debería haberlo creado
        }

        // Asignar rol de creator por defecto (usar upsert)
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: authData.user.id,
            role: 'creator',
          }, { onConflict: 'user_id' });

        if (roleError) {
          console.error('Error asignando rol:', roleError);
          // No lanzar error, el trigger de BD debería haberlo creado
        }

        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Azul con información */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1d4ed8] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 border-2 border-white rounded-lg transform -rotate-12"></div>
          <div className="absolute top-40 left-40 w-96 h-96 border-2 border-white rounded-lg transform -rotate-12"></div>
          <div className="absolute top-60 left-60 w-96 h-96 border-2 border-white rounded-lg transform -rotate-12"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white w-full min-h-screen">
          <div className="mb-auto pt-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold">EncuestasQR</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center w-full">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              ¡Únete a nosotros! 🚀
            </h1>
            
            <p className="text-xl text-blue-100 leading-relaxed max-w-md">
              Crea encuestas dinámicas, compártelas con códigos QR y obtén resultados en tiempo real.
            </p>
          </div>
          
          <div className="text-sm text-blue-200 mt-auto pb-8">
            © 2024 EncuestasQR. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Crea tu cuenta
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border-b-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#1d4ed8] focus:z-10 transition-colors"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-b-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#1d4ed8] focus:z-10 transition-colors"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="appearance-none relative block w-full px-4 py-3 border-b-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#1d4ed8] focus:z-10 transition-colors"
                  placeholder="Contraseña (mínimo 6 caracteres)"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 pt-2">
              Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#1d4ed8] hover:text-[#1e40af] underline"
              >
                Inicia sesión aquí.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

