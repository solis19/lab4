import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [genero, setGenero] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Formatear número de teléfono con guion (9999-9999)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo dígitos
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4);
    }
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validar número de teléfono (formato 9999-9999)
      if (!/^\d{4}-\d{4}$/.test(phone)) {
        setError('El número de teléfono debe tener el formato 9999-9999.');
        setIsLoading(false);
        return;
      }

      // Registrar usuario (guardar teléfono sin guion)
      const phoneClean = phone.replace('-', '');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            phone: phoneClean,
            genero: genero,
            fecha_nacimiento: fechaNacimiento,
          },
        },
      });

      if (signUpError) {
        // Verificar si el error es por usuario existente
        if (signUpError.message.includes('already registered') || 
            signUpError.message.includes('User already registered') ||
            signUpError.status === 422) {
          throw new Error('Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.');
        }
        throw signUpError;
      }

      // Verificar si el usuario ya existe (Supabase puede devolver success pero con user null)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.');
      }

      // Mostrar mensaje de éxito
      setSuccess(true);
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
        {/* Blob shapes decorativos más grandes */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl"></div>
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl"></div>
          <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white w-full min-h-screen">
          <div className="mb-auto pt-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold">Surveys QR</span>
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
            © 2025 Surveys QR. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
        {/* Blob shapes decorativos más grandes en el fondo */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Crea tu cuenta
            </h2>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  ¡Cuenta creada exitosamente!
                </h3>
                <p className="text-green-700 mb-4">
                  Se te ha enviado a tu correo el enlace de confirmación de cuenta.
                </p>
                <p className="text-sm text-green-600">
                  Por favor, revisa tu bandeja de entrada (y spam) y haz clic en el enlace para activar tu cuenta.
                </p>
              </div>
              
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-[#1d4ed8] hover:text-[#1e40af] font-semibold underline"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-b-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#1d4ed8] focus:z-10 transition-colors"
                  placeholder="Nombre completo *"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-b-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#1d4ed8] focus:z-10 transition-colors"
                  placeholder="Correo electrónico *"
                />
              </div>

              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  minLength={9}
                  maxLength={9}
                  pattern="\d{4}-\d{4}"
                  className="appearance-none relative block w-full px-4 py-3 border-b-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#1d4ed8] focus:z-10 transition-colors"
                  placeholder="Teléfono (9999-9999) *"
                />
              </div>

              <div>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-b-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#1d4ed8] focus:z-10 transition-colors bg-transparent"
                >
                  <option value="" disabled>Género *</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>

              <div>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="appearance-none relative block w-full px-4 py-3 border-b-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#1d4ed8] focus:z-10 transition-colors"
                  placeholder="Fecha de nacimiento *"
                />
              </div>

               <div className="relative">
                 <input
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   minLength={6}
                   className="appearance-none relative block w-full px-4 py-3 pr-12 border-b-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#1d4ed8] focus:z-10 transition-colors"
                   placeholder="Contraseña (mínimo 6 caracteres) *"
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                   aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                 >
                   {showPassword ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                     </svg>
                   ) : (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                   )}
                 </button>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

