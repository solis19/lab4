# Arquitectura de Servicios - Surveys QR

## 📋 Resumen

Se ha implementado una arquitectura de servicios para separar la lógica de negocio y las operaciones CRUD de Supabase de los componentes de React. Esto hace el código más:

- ✅ **Mantenible**: Cambios en la lógica de datos en un solo lugar
- ✅ **Reutilizable**: Servicios compartidos entre componentes
- ✅ **Testeable**: Fácil de hacer pruebas unitarias
- ✅ **Organizado**: Separación clara de responsabilidades

---

## 🗂️ Estructura de Servicios

```
src/services/
├── index.ts              # Exporta todos los servicios
├── authService.ts        # Autenticación y perfil
├── userService.ts        # Gestión de usuarios
├── roleService.ts        # Gestión de roles
├── surveyService.ts      # CRUD de encuestas
├── questionService.ts    # CRUD de preguntas y opciones
├── responseService.ts    # Respuestas de encuestas
└── auditService.ts       # Logs de auditoría
```

---

## 📦 Servicios Implementados

### 1. `authService.ts`
Maneja autenticación y perfil del usuario actual.

**Métodos:**
- `getProfile(userId)` - Obtener perfil de usuario
- `getUserRole(userId)` - Obtener rol de usuario
- `updateProfile(userId, profileData)` - Actualizar perfil
- `signOut()` - Cerrar sesión

**Usado en:**
- `AuthContext.tsx`

---

### 2. `userService.ts`
Gestión completa de usuarios (admin).

**Métodos:**
- `getAllUsers()` - Obtener todos los usuarios con emails y roles
- `updateUser(userId, profileData, role)` - Actualizar usuario y rol
- `getUserEmail(userId)` - Obtener email de un usuario

**Usado en:**
- `pages/admin/Users.tsx`

---

### 3. `roleService.ts`
Gestión de roles del sistema.

**Métodos:**
- `getAllRoles()` - Obtener todos los roles asignados
- `getUsersForRoleAssignment()` - Lista de usuarios para asignar roles
- `assignRole(userId, role)` - Asignar o actualizar rol
- `revokeRole(userId)` - Revocar rol

**Usado en:**
- `pages/admin/Roles.tsx`

---

### 4. `surveyService.ts`
CRUD completo de encuestas.

**Métodos:**
- `getUserSurveys(userId)` - Encuestas de un usuario
- `getSurveyById(surveyId)` - Obtener encuesta por ID
- `getSurveyByPublicSlug(publicSlug)` - Obtener encuesta pública
- `createSurvey(surveyData)` - Crear nueva encuesta
- `updateSurvey(surveyId, updates)` - Actualizar encuesta
- `deleteSurvey(surveyId)` - Eliminar encuesta
- `getUserSurveyStats(userId)` - Estadísticas de encuestas

**Usado en:**
- `pages/Dashboard.tsx`
- `pages/SurveyBuilder.tsx`
- `pages/SurveyDetails.tsx`
- `pages/SurveyPublic.tsx`

---

### 5. `questionService.ts`
CRUD de preguntas y opciones.

**Métodos:**
- `getSurveyQuestions(surveyId)` - Obtener preguntas de una encuesta
- `createQuestion(questionData)` - Crear pregunta
- `updateQuestion(questionId, updates)` - Actualizar pregunta
- `deleteQuestion(questionId)` - Eliminar pregunta
- `createOptions(options)` - Crear opciones para pregunta
- `getQuestionOptions(questionId)` - Obtener opciones de pregunta

**Usado en:**
- `pages/SurveyBuilder.tsx`
- `pages/SurveyDetails.tsx`
- `pages/SurveyPublic.tsx`
- `pages/SurveyResults.tsx`

---

### 6. `responseService.ts`
Gestión de respuestas a encuestas.

**Métodos:**
- `getSurveyResponses(surveyId)` - Obtener respuestas de encuesta
- `getResponseItems(responseIds)` - Obtener items de respuesta
- `createResponse(responseData)` - Crear respuesta
- `createResponseItems(items)` - Crear items de respuesta
- `countSurveyResponses(surveyId)` - Contar respuestas

**Usado en:**
- `pages/SurveyPublic.tsx`
- `pages/SurveyResults.tsx`

---

### 7. `auditService.ts`
Logs de auditoría del sistema.

**Métodos:**
- `getAllAuditLogs()` - Obtener todos los logs
- `createAuditLog(logData)` - Crear log de auditoría
- `getUserAuditLogs(userId)` - Logs de un usuario
- `getTableAuditLogs(tableName)` - Logs de una tabla

**Usado en:**
- `pages/admin/AuditLog.tsx`

---

## 🔄 Patrón de Uso

### Antes (sin servicios):
```typescript
// En el componente
const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Lógica compleja para obtener emails y roles
  const usersWithDetails = await Promise.all(
    (data || []).map(async (user) => {
      // ... más código de Supabase
    })
  );

  setUsers(usersWithDetails);
};
```

### Después (con servicios):
```typescript
// En el componente
import { userService } from '../services';

const fetchUsers = async () => {
  const usersData = await userService.getAllUsers();
  setUsers(usersData);
};
```

---

## ✅ Ventajas

### 1. **Código más limpio**
Los componentes se enfocan en la UI, no en la lógica de datos.

### 2. **Reutilización**
Un mismo servicio puede ser usado por múltiples componentes.

### 3. **Mantenimiento**
Si cambia la estructura de la BD, solo actualizas el servicio.

### 4. **Testing**
Fácil de hacer mocks y pruebas unitarias.

### 5. **Tipado**
TypeScript puede inferir mejor los tipos.

---

## 📝 Componentes Actualizados

✅ **Completados:**
1. `AuthContext.tsx` - Usa `authService`
2. `pages/admin/Users.tsx` - Usa `userService`
3. `pages/admin/Roles.tsx` - Usa `roleService`
4. `pages/Dashboard.tsx` - Usa `surveyService`
5. `pages/SurveyBuilder.tsx` - Usa `surveyService` y `questionService`

⏳ **Pendientes:**
6. `pages/SurveyDetails.tsx` - Necesita `surveyService` y `questionService`
7. `pages/SurveyPublic.tsx` - Necesita `surveyService`, `questionService` y `responseService`
8. `pages/SurveyResults.tsx` - Necesita `surveyService`, `questionService` y `responseService`

---

## 🚀 Próximos Pasos

1. Completar migración de componentes restantes
2. Agregar manejo de errores centralizado
3. Implementar caché de datos si es necesario
4. Agregar logs de auditoría en operaciones críticas

---

## 📖 Ejemplo Completo

### Crear una encuesta (antes vs después)

**Antes:**
```typescript
const { data: survey, error } = await supabase
  .from('surveys')
  .insert({
    owner_id: user.id,
    title: title.trim(),
    description: description.trim() || null,
    status: 'draft',
    public_slug: publicSlug,
    slug: baseSlug,
  })
  .select()
  .single();

if (error) throw error;
```

**Después:**
```typescript
const survey = await surveyService.createSurvey({
  owner_id: user.id,
  title: title.trim(),
  description: description.trim() || null,
  status: 'draft',
  public_slug: publicSlug,
  slug: baseSlug,
});
```

Más limpio, más legible, más mantenible. 🎉

