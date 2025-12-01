# Plataforma de Encuestas QR

Aplicación frontend para gestión de encuestas y formularios dinámicos construida con React, TypeScript, Vite y Supabase.

## Características

- 🔐 Autenticación y gestión de roles (admin/creator)
- 📝 Constructor de formularios dinámicos
- 📊 Visualización de resultados con gráficos
- 📱 Generación de códigos QR para compartir encuestas
- 👥 Panel de administración para gestión de usuarios
- 📋 Sistema de auditoría

## Tecnologías

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Supabase** - Backend as a Service (PostgreSQL, Auth, Storage)
- **React Router** - Navegación
- **Recharts** - Gráficos
- **qrcode.react** - Generación de códigos QR

## Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Supabase con la base de datos configurada

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd EncuestasQR
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` y agregar tus credenciales de Supabase:
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

4. Ejecutar en modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/              # Componentes UI base
│   ├── Survey/          # Componentes de preguntas
│   └── SurveyBuilder/   # Componentes del constructor
├── contexts/            # Contextos de React
├── hooks/               # Custom hooks
├── layouts/             # Layouts de páginas
├── lib/                 # Utilidades y cliente Supabase
├── pages/               # Páginas principales
│   └── admin/           # Páginas de administración
├── types/               # Definiciones TypeScript
└── utils/               # Funciones auxiliares
```

## Funcionalidades Principales

### Autenticación
- Login y registro de usuarios
- Gestión de sesiones con Supabase Auth
- Redirección automática según rol

### Dashboard (Creator)
- KPIs: Total de formularios, respuestas y formularios activos
- Tabla de actividad reciente
- Acceso rápido para crear nuevas encuestas

### Constructor de Formularios
- Creación de encuestas con múltiples preguntas
- Tipos de preguntas soportados:
  - Texto libre
  - Opción única (radio)
  - Opción múltiple (checkbox)
  - Escala Likert
- Guardado transaccional en la base de datos

### Vista Pública de Encuestas
- Acceso mediante URL pública o código QR
- Soporte para usuarios anónimos y autenticados
- Validación de campos requeridos

### Panel de Administración
- Gestión de usuarios (CRUD de perfiles)
- Asignación y revocación de roles
- Vista de auditoría (solo lectura)

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Base de Datos

La aplicación requiere las siguientes tablas en Supabase:

- `profiles` - Perfiles de usuario
- `user_roles` - Roles de usuario
- `surveys` - Encuestas
- `survey_questions` - Preguntas
- `survey_options` - Opciones de preguntas
- `responses` - Respuestas
- `response_items` - Items de respuesta
- `audit_log` - Logs de auditoría

Ver `Doc/ReadmeBD.txt` para más detalles sobre la estructura de la base de datos.

## Despliegue

### Vercel

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno
3. Desplegar automáticamente

## Integración Continua (CI/CD)

Este proyecto utiliza **GitHub Actions** y **SonarCloud** para análisis de calidad de código.

### Configuración de SonarCloud

1. Crear cuenta en [SonarCloud](https://sonarcloud.io/)
2. Importar tu repositorio de GitHub
3. Obtener tu `Organization Key` y `Project Key`
4. Actualizar el archivo `sonar-project.properties`:
   ```properties
   sonar.projectKey=tu-usuario_encuestas-qr
   sonar.organization=tu-organizacion
   ```
5. Agregar el token de SonarCloud a los secrets de GitHub:
   - Ve a tu repositorio → Settings → Secrets and variables → Actions
   - Crea un nuevo secret llamado `SONAR_TOKEN`
   - Pega el token generado en SonarCloud

### GitHub Actions

El workflow de CI se ejecuta automáticamente en:
- Push a las ramas `main` y `develop`
- Pull requests hacia `main` y `develop`

El workflow realiza:
- ✅ Instalación de dependencias
- ✅ Ejecución del linter (ESLint)
- ✅ Build del proyecto
- ✅ Análisis de calidad con SonarCloud

Ver el archivo `.github/workflows/ci.yml` para más detalles.

## Licencia

MIT
