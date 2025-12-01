# 📝 Configuración Completa del Registro de Usuarios

## 🎯 Objetivo

Configurar el sistema para que al registrarse, los usuarios proporcionen:
- ✅ Nombre completo (obligatorio)
- ✅ Correo electrónico (obligatorio)
- ✅ Número de teléfono (obligatorio)
- ✅ Género (obligatorio)
- ✅ Fecha de nacimiento (obligatorio)
- ✅ Contraseña (obligatorio)

Y además:
- ✅ Validar que el correo no esté registrado previamente
- ✅ Crear automáticamente el perfil con todos los datos
- ✅ Asignar rol por defecto ('creator')

---

## 🔧 Paso 1: Configurar el Trigger en Supabase

Este trigger crea automáticamente el perfil y el rol cuando un usuario se registra.

### Ejecutar en el SQL Editor de Supabase:

```sql
-- Eliminar el trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear la función que maneja el nuevo usuario
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
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'genero', NULL),
    COALESCE(NEW.raw_user_meta_data->>'fecha_nacimiento', NULL),
    'creator',
    NOW(),
    NOW()
  );

  -- Insertar el rol por defecto en user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'creator');

  RETURN NEW;
END;
$$;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎨 Paso 2: Frontend - Formulario de Registro

El formulario ya está configurado en `src/pages/Register.tsx` con:

### Campos del formulario:
1. **Nombre completo** - Campo de texto obligatorio
2. **Correo electrónico** - Campo email obligatorio
3. **Número de teléfono** - Campo tel obligatorio (exactamente 8 dígitos numéricos)
4. **Género** - Select obligatorio con opciones:
   - Masculino
   - Femenino
   - Otro
   - Prefiero no decir
5. **Fecha de nacimiento** - Campo date obligatorio (con validación de fecha máxima = hoy)
6. **Contraseña** - Campo password obligatorio (mínimo 6 caracteres)

### Validaciones implementadas:
- ✅ Todos los campos son obligatorios (atributo `required`)
- ✅ Validación de email
- ✅ Validación de número de teléfono (exactamente 8 dígitos numéricos)
- ✅ Validación de contraseña mínima (6 caracteres)
- ✅ Validación de fecha de nacimiento (no puede ser futura)
- ✅ Detección de usuario duplicado con mensaje claro

### Flujo de registro:
1. Usuario completa el formulario
2. Sistema valida que el correo no esté registrado
3. Si el correo ya existe → muestra error: *"Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo."*
4. Si el correo es nuevo → crea la cuenta en Supabase Auth
5. El trigger automáticamente crea el perfil en `profiles` con todos los datos
6. El trigger automáticamente asigna el rol 'creator' en `user_roles`
7. Se envía email de confirmación al usuario
8. Usuario confirma su cuenta y puede iniciar sesión

---

## 🔐 Paso 3: Verificar Políticas RLS

Asegúrate de que las políticas RLS estén configuradas correctamente:

```sql
-- Verificar que profiles permite INSERT
-- (Ya debería estar configurado según ConfiguracionRLS.md)

-- Política para insertar perfil propio
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
```

---

## ✅ Verificación del Sistema

### 1. Verificar que el trigger existe:
```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### 2. Probar el registro:
1. Ir a la página de registro
2. Completar todos los campos
3. Hacer clic en "Crear Cuenta"
4. Verificar que se muestra el mensaje de éxito

### 3. Verificar en la base de datos:
```sql
-- Ver los últimos usuarios registrados con sus perfiles
SELECT 
  au.email,
  p.display_name,
  p.phone,
  p.genero,
  p.fecha_nacimiento,
  ur.role,
  p.created_at
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_roles ur ON ur.user_id = au.id
ORDER BY p.created_at DESC
LIMIT 5;
```

### 4. Probar validación de duplicados:
1. Intentar registrarse con el mismo correo
2. Debe mostrar error: *"Este correo electrónico ya está registrado..."*

---

## 🐛 Solución de Problemas

### Error: "column profiles.email does not exist"
**Solución:** La tabla `profiles` no tiene columna `email`. El email está en `auth.users`. La validación de duplicados se hace mediante la respuesta de Supabase Auth.

### Error: "new row violates row-level security policy"
**Solución:** Verificar que la política `profiles_insert_own` esté activa y correctamente configurada.

### El perfil no se crea automáticamente
**Solución:** 
1. Verificar que el trigger `on_auth_user_created` existe
2. Verificar que la función `handle_new_user()` está creada
3. Revisar los logs de Supabase para ver errores del trigger

### Los datos adicionales no se guardan
**Solución:**
1. Verificar que el frontend envía los datos en `options.data`
2. Verificar que el trigger usa `raw_user_meta_data` correctamente
3. Los datos se guardan en los metadatos del usuario y luego el trigger los copia a `profiles`

---

## 📊 Estructura de Datos

### Tabla `profiles`:
```
- id (UUID, PK, FK → auth.users.id)
- display_name (TEXT)
- phone (TEXT)
- genero (TEXT)
- fecha_nacimiento (DATE)
- role (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabla `user_roles`:
```
- user_id (UUID, PK, FK → auth.users.id)
- role (TEXT: 'admin' | 'creator')
```

### Metadatos del usuario (auth.users.raw_user_meta_data):
```json
{
  "display_name": "Juan Pérez",
  "phone": "555-1234",
  "genero": "masculino",
  "fecha_nacimiento": "1990-01-15"
}
```

---

## 🎉 Resultado Final

Después de completar esta configuración:

✅ Los usuarios deben completar todos los campos obligatorios al registrarse  
✅ El sistema valida que el correo no esté duplicado  
✅ El perfil se crea automáticamente con todos los datos  
✅ Se asigna automáticamente el rol 'creator'  
✅ Los usuarios reciben un email de confirmación  
✅ La experiencia de usuario es fluida y clara  

---

## 📝 Archivos Modificados

- ✅ `src/pages/Register.tsx` - Formulario con campos adicionales
- ✅ `Doc/TriggerRegistroUsuario.sql` - Script SQL del trigger
- ✅ `Doc/ConfiguracionRegistroCompleto.md` - Esta documentación

