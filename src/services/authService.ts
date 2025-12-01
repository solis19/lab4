import { supabase } from '../lib/supabaseClient';
import { Profile, UserRole } from '../types/database.types';

export const authService = {
  /**
   * Obtener el perfil de un usuario
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtener el rol de un usuario
   */
  async getUserRole(userId: string): Promise<UserRole | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data?.role || null;
  },

  /**
   * Actualizar el perfil de un usuario
   */
  async updateProfile(
    userId: string,
    profileData: Partial<Profile>
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Cerrar sesión
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    // No lanzar error - forzar cierre de sesión local aunque falle en el servidor
    if (error) {
      console.warn('Error al cerrar sesión en servidor, cerrando localmente:', error);
    }
  },
};

