Informe Completo de Lógica de Base de Datos - Supabase Backend de Encuestas
Introducción
Este documento describe de forma detallada la lógica de la base de datos implementada en Supabase para un sistema serverless de encuestas. Incluye el propósito de cada tabla, sus relaciones, políticas de seguridad (RLS) y la configuración del bucket de almacenamiento. Esta explicación también sirve como guía para el desarrollo del frontend.
Tecnologías Utilizadas
- Supabase (PostgreSQL, Auth, Storage)
- Row Level Security (RLS)
- SQL como base de la lógica de datos
Arquitectura General
La base de datos está diseñada para manejar usuarios, encuestas, preguntas, opciones y respuestas, siguiendo un modelo relacional altamente seguro con validación por usuario y roles.
Tabla: auth.users
Tabla interna de Supabase.
Sirve para almacenar los usuarios autenticados del sistema.
No se modifica directamente.
Es la base de todos los permisos.
Campos clave:
- id: identificador del usuario.
- email: correo del usuario.
Tabla: profiles
Extiende auth.users. Guarda información adicional del usuario.
Usada por el frontend para mostrar perfil y datos personales.
Campos:
- id: PK y FK → auth.users.id.
- display_name: nombre público.
- role: rol del usuario.
- phone, genero, fecha_nacimiento.
Función:
- Permite mostrar información personal del usuario.
- Determina atributos visibles en el frontend.
Tabla: user_roles
Define los roles del usuario.
Sirve para restringir funcionalidades en el frontend (admin o creator).
Campos:
- user_id: FK → auth.users.id.
- role: admin | creator.
Función:
- Determina pantallas y permisos en el frontend.
Tabla: surveys
Tabla central del sistema.
Contiene la estructura base de cada encuesta.
Campos principales:
- owner_id: dueño de la encuesta.
- title, description.
- status: draft, published, closed.
- public_slug y slug: permiten URLs amigables.
Función en frontend:
- Mostrar lista de encuestas creadas.
- Crear nuevas encuestas.
- Publicar o cerrar encuestas.
Tabla: survey_questions
Almacena las preguntas de una encuesta.
Campos principales:
- type: single, multiple, likert, text.
- question_text: enunciado.
- required: si es obligatoria.
- options(json): opciones internas.
Función en frontend:
- Renderizar los campos dinámicamente.
- Mostrar formularios personalizados según el tipo.
Tabla: survey_options
Almacena opciones de preguntas tipo selección.
Campos:
- label: texto de la opción.
- value: valor enviado.
Función:
- Renderiza botones, radios, checkboxes en el frontend.
Tabla: responses
Representa una respuesta completa a una encuesta.
Campos:
- survey_id: qué encuesta se respondió.
- submitted_at.
- user_id: si el usuario está autenticado.
Función:
- Permite mostrar analytics por encuesta.
- Guardar historial de respuestas.
Tabla: response_items
Cada respuesta por pregunta.
Campos:
- value_text: respuesta escrita.
- value_numeric: escalas.
- value_json: múltiples opciones.
Función:
- Construir gráficos y reportes en el frontend.
Tabla: audit_log
Tabla de auditoría.
Registra acciones importantes:
- create, publish, update, archive.
Función:
- Permite logs internos.
- Ayuda a mostrar historial de acciones.
Relaciones Principales
- auth.users 1–1 profiles
- profiles 1–N surveys
- surveys 1–N survey_questions
- survey_questions 1–N survey_options
- surveys 1–N responses
- responses 1–N response_items
- survey_questions 1–N response_items
Políticas RLS
Se activó RLS para proteger los datos.
Ejemplos:
• Un usuario solo ve su perfil.
• Solo el creador administra sus encuestas.
• Encuestas publicadas pueden ser vistas por cualquier usuario.
• Solo dueños ven respuestas completas.
Bucket survey-media
Bucket para almacenar imágenes o multimedia.
Políticas:
- INSERT: usuarios autenticados pueden subir.
- SELECT: lectura pública o autenticada.
- DELETE: solo el dueño puede borrar.
Función en frontend:
- Mostrar imágenes de portada.
- Guardar archivos de preguntas.
Flujos Principales del Sistema
1. Registro → creación de perfil + rol.
2. Crear encuesta → agregar preguntas y opciones.
3. Publicar encuesta.
4. Usuario responde.
5. Sistema genera responses y response_items.
6. Frontend muestra estadísticas y reportes.
