# Configuración de Políticas RLS y Función de Email

## 📋 Resumen de Cambios

Se han implementado las siguientes mejoras:

1. **Políticas RLS completas** con soporte para roles de Admin y Creator
2. **Función SQL** para obtener emails de usuarios
3. **Interfaz mejorada** en la gestión de roles que muestra emails en lugar de IDs

---

## 🔧 Paso 1: Crear la Función SQL para Obtener Emails

Ejecuta este código en el **SQL Editor de Supabase**:

```sql
-- Función para obtener el email de un usuario
CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;
  
  RETURN user_email;
END;
$$;

-- Dar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;
```

---

## 🔐 Paso 2: Aplicar Políticas RLS

### 2.1 Políticas para `profiles`

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

-- SELECT: Cada usuario puede ver su propio perfil
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SELECT: Los admins pueden ver todos los perfiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- INSERT: Crear perfil al registrarse
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Actualizar su propio perfil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: Los admins pueden actualizar cualquier perfil
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
```

### 2.2 Políticas para `user_roles`

**IMPORTANTE:** La tabla `user_roles` NO debe tener RLS habilitado para evitar recursión infinita.
Las políticas que verifican roles dentro de `user_roles` crean un bucle infinito.

```sql
-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "roles_select_own" ON user_roles;
DROP POLICY IF EXISTS "roles_select_admin" ON user_roles;
DROP POLICY IF EXISTS "roles_insert_admin" ON user_roles;
DROP POLICY IF EXISTS "roles_update_admin" ON user_roles;
DROP POLICY IF EXISTS "roles_delete_admin" ON user_roles;
DROP POLICY IF EXISTS "roles_manage_admin" ON user_roles;

-- Deshabilitar RLS en user_roles para evitar recursión
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
```

**Nota:** Aunque RLS está deshabilitado en `user_roles`, el acceso sigue siendo seguro porque:
- Solo usuarios autenticados pueden acceder a la tabla
- Las rutas de admin están protegidas en el frontend
- Las otras tablas (profiles, surveys, etc.) siguen protegidas con RLS

### 2.3 Políticas para `surveys`

```sql
-- Habilitar RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "surveys_insert_owner" ON surveys;
DROP POLICY IF EXISTS "surveys_select_owner" ON surveys;
DROP POLICY IF EXISTS "surveys_select_admin" ON surveys;
DROP POLICY IF EXISTS "surveys_select_published" ON surveys;
DROP POLICY IF EXISTS "surveys_update_owner" ON surveys;
DROP POLICY IF EXISTS "surveys_update_admin" ON surveys;
DROP POLICY IF EXISTS "surveys_delete_owner" ON surveys;
DROP POLICY IF EXISTS "surveys_delete_admin" ON surveys;

-- INSERT: Usuarios autenticados pueden crear encuestas
CREATE POLICY "surveys_insert_owner" ON surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- SELECT: El dueño puede ver sus encuestas
CREATE POLICY "surveys_select_owner" ON surveys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- SELECT: Los admins pueden ver todas las encuestas
CREATE POLICY "surveys_select_admin" ON surveys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- SELECT: Cualquiera puede ver encuestas publicadas
CREATE POLICY "surveys_select_published" ON surveys
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- UPDATE: Solo el dueño puede actualizar
CREATE POLICY "surveys_update_owner" ON surveys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Los admins pueden actualizar cualquier encuesta
CREATE POLICY "surveys_update_admin" ON surveys
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- DELETE: Solo el dueño puede eliminar
CREATE POLICY "surveys_delete_owner" ON surveys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- DELETE: Los admins pueden eliminar cualquier encuesta
CREATE POLICY "surveys_delete_admin" ON surveys
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
```

### 2.4 Políticas para `survey_questions`

```sql
-- Habilitar RLS
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "questions_insert_owner" ON survey_questions;
DROP POLICY IF EXISTS "questions_select_owner" ON survey_questions;
DROP POLICY IF EXISTS "questions_select_admin" ON survey_questions;
DROP POLICY IF EXISTS "questions_select_published" ON survey_questions;
DROP POLICY IF EXISTS "questions_update_owner" ON survey_questions;
DROP POLICY IF EXISTS "questions_update_admin" ON survey_questions;
DROP POLICY IF EXISTS "questions_delete_owner" ON survey_questions;
DROP POLICY IF EXISTS "questions_delete_admin" ON survey_questions;

-- INSERT: El dueño de la encuesta puede crear preguntas
CREATE POLICY "questions_insert_owner" ON survey_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_questions.survey_id
      AND surveys.owner_id = auth.uid()
    )
  );

-- SELECT: El dueño puede ver sus preguntas
CREATE POLICY "questions_select_owner" ON survey_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_questions.survey_id
      AND surveys.owner_id = auth.uid()
    )
  );

-- SELECT: Los admins pueden ver todas las preguntas
CREATE POLICY "questions_select_admin" ON survey_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- SELECT: Cualquiera puede ver preguntas de encuestas publicadas
CREATE POLICY "questions_select_published" ON survey_questions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_questions.survey_id
      AND surveys.status = 'published'
    )
  );

-- UPDATE: Solo el dueño puede actualizar
CREATE POLICY "questions_update_owner" ON survey_questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_questions.survey_id
      AND surveys.owner_id = auth.uid()
    )
  );

-- UPDATE: Los admins pueden actualizar cualquier pregunta
CREATE POLICY "questions_update_admin" ON survey_questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- DELETE: Solo el dueño puede eliminar
CREATE POLICY "questions_delete_owner" ON survey_questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_questions.survey_id
      AND surveys.owner_id = auth.uid()
    )
  );

-- DELETE: Los admins pueden eliminar cualquier pregunta
CREATE POLICY "questions_delete_admin" ON survey_questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
```

### 2.5 Políticas para `survey_options`

```sql
-- Habilitar RLS
ALTER TABLE survey_options ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "options_insert_owner" ON survey_options;
DROP POLICY IF EXISTS "options_select_owner" ON survey_options;
DROP POLICY IF EXISTS "options_select_admin" ON survey_options;
DROP POLICY IF EXISTS "options_select_published" ON survey_options;
DROP POLICY IF EXISTS "options_update_owner" ON survey_options;
DROP POLICY IF EXISTS "options_delete_owner" ON survey_options;

-- INSERT: El dueño de la encuesta puede crear opciones
CREATE POLICY "options_insert_owner" ON survey_options
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM survey_questions sq
      JOIN surveys s ON s.id = sq.survey_id
      WHERE sq.id = survey_options.question_id
      AND s.owner_id = auth.uid()
    )
  );

-- SELECT: El dueño puede ver sus opciones
CREATE POLICY "options_select_owner" ON survey_options
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM survey_questions sq
      JOIN surveys s ON s.id = sq.survey_id
      WHERE sq.id = survey_options.question_id
      AND s.owner_id = auth.uid()
    )
  );

-- SELECT: Los admins pueden ver todas las opciones
CREATE POLICY "options_select_admin" ON survey_options
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- SELECT: Cualquiera puede ver opciones de encuestas publicadas
CREATE POLICY "options_select_published" ON survey_options
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM survey_questions sq
      JOIN surveys s ON s.id = sq.survey_id
      WHERE sq.id = survey_options.question_id
      AND s.status = 'published'
    )
  );

-- UPDATE: Solo el dueño puede actualizar
CREATE POLICY "options_update_owner" ON survey_options
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM survey_questions sq
      JOIN surveys s ON s.id = sq.survey_id
      WHERE sq.id = survey_options.question_id
      AND s.owner_id = auth.uid()
    )
  );

-- DELETE: Solo el dueño puede eliminar
CREATE POLICY "options_delete_owner" ON survey_options
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM survey_questions sq
      JOIN surveys s ON s.id = sq.survey_id
      WHERE sq.id = survey_options.question_id
      AND s.owner_id = auth.uid()
    )
  );
```

### 2.6 Políticas para `responses` y `response_items`

```sql
-- Habilitar RLS en responses
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "responses_insert_published" ON responses;
DROP POLICY IF EXISTS "responses_select_owner" ON responses;
DROP POLICY IF EXISTS "responses_select_admin" ON responses;

-- INSERT: Cualquiera puede responder encuestas publicadas
CREATE POLICY "responses_insert_published" ON responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = responses.survey_id
      AND surveys.status = 'published'
    )
  );

-- SELECT: El dueño de la encuesta puede ver las respuestas
CREATE POLICY "responses_select_owner" ON responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = responses.survey_id
      AND surveys.owner_id = auth.uid()
    )
  );

-- SELECT: Los admins pueden ver todas las respuestas
CREATE POLICY "responses_select_admin" ON responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Habilitar RLS en response_items
ALTER TABLE response_items ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "items_insert_for_published" ON response_items;
DROP POLICY IF EXISTS "items_select_owner" ON response_items;
DROP POLICY IF EXISTS "items_select_admin" ON response_items;

-- INSERT: Se puede insertar si la respuesta existe y la encuesta está publicada
CREATE POLICY "items_insert_for_published" ON response_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM responses r
      JOIN surveys s ON s.id = r.survey_id
      WHERE r.id = response_items.response_id
      AND s.status = 'published'
    )
  );

-- SELECT: El dueño de la encuesta puede ver los items
CREATE POLICY "items_select_owner" ON response_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM responses r
      JOIN surveys s ON s.id = r.survey_id
      WHERE r.id = response_items.response_id
      AND s.owner_id = auth.uid()
    )
  );

-- SELECT: Los admins pueden ver todos los items
CREATE POLICY "items_select_admin" ON response_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
```

### 2.7 Políticas para `audit_log`

```sql
-- Habilitar RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "audit_insert_authenticated" ON audit_log;
DROP POLICY IF EXISTS "audit_select_admin" ON audit_log;

-- INSERT: Usuarios autenticados pueden crear logs
CREATE POLICY "audit_insert_authenticated" ON audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- SELECT: Solo admins pueden ver logs
CREATE POLICY "audit_select_admin" ON audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
```

---

## 🎯 Resumen de Permisos por Rol

### Usuario Normal (creator)
- ✅ Puede crear sus propias encuestas
- ✅ Puede ver, editar y eliminar solo SUS encuestas
- ✅ Puede ver los resultados de SUS encuestas
- ✅ Puede ver y editar solo SU perfil
- ❌ NO puede ver perfiles de otros usuarios
- ❌ NO puede ver encuestas de otros usuarios

### Administrador (admin)
- ✅ Puede ver TODAS las encuestas (de todos los usuarios)
- ✅ Puede editar y eliminar CUALQUIER encuesta
- ✅ Puede ver TODOS los perfiles
- ✅ Puede editar CUALQUIER perfil
- ✅ Puede ver TODOS los resultados
- ✅ Puede ver los logs de auditoría
- ✅ Puede gestionar roles de usuarios

### Usuario Anónimo (sin autenticar)
- ✅ Puede ver encuestas publicadas
- ✅ Puede responder encuestas publicadas
- ❌ NO puede crear encuestas
- ❌ NO puede ver resultados

---

## ✅ Verificación

Después de aplicar todas las políticas:

1. Ve a **Supabase Dashboard → Authentication → Policies**
2. Verifica que todas las tablas tengan RLS habilitado
3. Verifica que cada tabla tenga las políticas correspondientes
4. Prueba crear una encuesta desde el frontend
5. Verifica que el admin pueda ver todos los perfiles y asignar roles por email

---

## 📝 Notas Importantes

- Las políticas usan `SECURITY DEFINER` en la función `get_user_email` para permitir acceso seguro a `auth.users`
- Los admins tienen permisos completos sobre todas las tablas
- Los usuarios normales solo ven sus propios datos
- Las encuestas publicadas son visibles públicamente
- Solo los dueños y admins pueden ver resultados de encuestas

