import { supabase } from '../lib/supabaseClient';
import { Profile, UserRole } from '../types/database.types';

export interface UserWithRole extends Profile {
  email?: string;
  user_role?: UserRole | null;
}

export const userService = {
  /**
   * Obtener todos los usuarios con sus roles y emails
   */
  async getAllUsers(): Promise<UserWithRole[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Obtener emails y roles para cada usuario
    const usersWithDetails = await Promise.all(
      (data || []).map(async (user) => {
        // Obtener email
        const { data: emailData } = await supabase.rpc('get_user_email', {
          user_uuid: user.id,
        });

        // Obtener rol
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        return {
          ...user,
          email: emailData || undefined,
          user_role: roleData?.role || null,
        };
      })
    );

    return usersWithDetails;
  },

  /**
   * Actualizar un usuario (perfil y rol)
   */
  async updateUser(
    userId: string,
    profileData: Partial<Profile>,
    role?: UserRole | ''
  ): Promise<void> {
    // Actualizar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    if (profileError) throw profileError;

    // Actualizar o crear rol
    if (role) {
      // Verificar si ya tiene un rol
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingRole) {
        // Actualizar rol existente
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);

        if (roleError) throw roleError;
      } else {
        // Crear nuevo rol
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (roleError) throw roleError;
      }
    } else {
      // Si se eliminó el rol, borrarlo de la base de datos
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError && deleteError.code !== 'PGRST116') {
        // PGRST116 = no rows found, es OK
        throw deleteError;
      }
    }
  },

  /**
   * Obtener email de un usuario
   */
  async getUserEmail(userId: string): Promise<string | null> {
    const { data } = await supabase.rpc('get_user_email', {
      user_uuid: userId,
    });
    return data;
  },
};

