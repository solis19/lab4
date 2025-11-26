import { supabase } from '../lib/supabaseClient';
import { UserRole, Profile } from '../types/database.types';

export interface UserRoleRecord {
  user_id: string;
  role: UserRole;
  profile?: Profile;
  email?: string;
}

export interface UserOption {
  id: string;
  email: string;
  display_name?: string;
}

export const roleService = {
  /**
   * Obtener todos los roles con información de usuario
   */
  async getAllRoles(): Promise<UserRoleRecord[]> {
    const { data, error } = await supabase.from('user_roles').select('*');

    if (error) throw error;

    // Obtener perfiles y emails
    const rolesWithProfiles = await Promise.all(
      (data || []).map(async (role) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', role.user_id)
          .single();

        // Obtener email usando la función SQL
        const { data: emailData } = await supabase.rpc('get_user_email', {
          user_uuid: role.user_id,
        });

        return {
          ...role,
          profile: profile || undefined,
          email: emailData || undefined,
        };
      })
    );

    return rolesWithProfiles;
  },

  /**
   * Obtener lista de usuarios para asignar roles
   */
  async getUsersForRoleAssignment(): Promise<UserOption[]> {
    // Obtener todos los perfiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .order('id', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Obtener emails para cada perfil
    const usersWithEmails = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: emailData } = await supabase.rpc('get_user_email', {
          user_uuid: profile.id,
        });

        return {
          id: profile.id,
          email: emailData || 'Sin email',
          display_name: profile.display_name || undefined,
        };
      })
    );

    return usersWithEmails;
  },

  /**
   * Asignar o actualizar rol de un usuario
   */
  async assignRole(userId: string, role: UserRole): Promise<void> {
    // Verificar si el usuario ya tiene un rol
    const { data: existing } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Actualizar rol existente
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Crear nuevo rol
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
    }
  },

  /**
   * Revocar rol de un usuario
   */
  async revokeRole(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};

