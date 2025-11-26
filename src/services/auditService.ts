import { supabase } from '../lib/supabaseClient';
import { AuditLog } from '../types/database.types';

export const auditService = {
  /**
   * Obtener todos los logs de auditoría
   */
  async getAllAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  /**
   * Crear un log de auditoría
   */
  async createAuditLog(logData: {
    user_id: string | null;
    action: string;
    table_name: string;
    record_id?: string | null;
    details?: Record<string, any> | null;
  }): Promise<void> {
    const { error } = await supabase.from('audit_log').insert(logData);

    if (error) throw error;
  },

  /**
   * Obtener logs de un usuario específico
   */
  async getUserAuditLogs(userId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener logs de una tabla específica
   */
  async getTableAuditLogs(tableName: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('table_name', tableName)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },
};

