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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

