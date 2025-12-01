-- ============================================
-- TRIGGER PARA CREAR PERFIL AL REGISTRARSE
-- ============================================
-- Este trigger crea automáticamente un perfil en la tabla 'profiles'
-- cuando un nuevo usuario se registra en auth.users
-- Los datos adicionales (display_name, phone, genero, fecha_nacimiento)
-- se toman de los metadatos del usuario (user_metadata)

-- Paso 1: Eliminar el trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Paso 2: Crear la función que maneja el nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insertar el nuevo perfil con los datos del registro
  INSERT INTO public.profiles (
    id,
    display_name,
    phone,
    genero,
    fecha_nacimiento,
    role,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'genero',
    (NEW.raw_user_meta_data->>'fecha_nacimiento')::date,
    'creator',
    NOW()
  );

  -- Insertar el rol por defecto en user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'creator');

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Si hay error, solo registrar en auth.users sin perfil
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Paso 3: Crear el trigger que ejecuta la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Para verificar que el trigger funciona:
-- 1. Registra un nuevo usuario desde el frontend
-- 2. Verifica que se creó el perfil en 'profiles' con todos los datos
-- 3. Verifica que se creó el rol en 'user_roles'

-- Consulta para verificar:
-- SELECT p.*, ur.role 
-- FROM profiles p 
-- LEFT JOIN user_roles ur ON ur.user_id = p.id 
-- ORDER BY p.created_at DESC 
-- LIMIT 5;

