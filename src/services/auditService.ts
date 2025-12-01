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
      .order('at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  /**
   * Crear un log de auditoría manualmente (opcional, los triggers lo hacen automáticamente)
   */
  async createAuditLog(logData: {
    actor_id: string | null;
    action: string;
    target_id?: string | null;
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
      .eq('actor_id', userId)
      .order('at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener logs de una tabla específica (filtrando por action que contenga el nombre de la tabla)
   */
  async getTableAuditLogs(tableName: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .like('action', `${tableName}_%`)
      .order('at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },
};

