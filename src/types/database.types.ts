// Tipos de base de datos basados en la estructura de Supabase

export type UserRole = 'admin' | 'creator';

export type SurveyStatus = 'draft' | 'published' | 'closed';

export type QuestionType = 'single' | 'multiple' | 'likert' | 'text';

export interface Profile {
  id: string;
  display_name: string | null;
  role: string | null;
  phone: string | null;
  genero: string | null;
  fecha_nacimiento: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserRoleRecord {
  user_id: string;
  role: UserRole;
}

export interface Survey {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  status: SurveyStatus;
  public_slug: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  type: QuestionType;
  question_text: string;
  required: boolean;
  options: Record<string, any> | null; // JSON field
  position?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SurveyOption {
  id: string;
  question_id: string;
  label: string;
  value: string;
  position?: number;
  created_at?: string;
}

export interface Response {
  id: string;
  survey_id: string;
  submitted_at: string;
  user_id: string | null;
  created_at?: string;
}

export interface ResponseItem {
  id: string;
  response_id: string;
  question_id: string;
  value_text: string | null;
  value_numeric: number | null;
  value_json: Record<string, any> | null;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;  // Usuario que realiza la acción
  action: string;            // Tipo de acción (create, update, delete, login, etc.)
  target_id: string | null;  // ID del registro afectado
  table_name?: string | null; // Tabla donde ocurrió la acción
  origin?: string | null;     // Pantalla / módulo de origen (opcional)
  at?: string;               // Timestamp de la acción
}

// Tipos para formularios y respuestas
export interface SurveyWithQuestions extends Survey {
  questions?: SurveyQuestionWithOptions[];
}

export interface SurveyQuestionWithOptions extends SurveyQuestion {
  options_list?: SurveyOption[];
}

export interface ResponseWithItems extends Response {
  items?: ResponseItem[];
}

