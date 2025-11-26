import { supabase } from '../lib/supabaseClient';
import { Response, ResponseItem } from '../types/database.types';

export const responseService = {
  /**
   * Obtener todas las respuestas de una encuesta
   */
  async getSurveyResponses(surveyId: string): Promise<Response[]> {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener items de respuesta por IDs de respuesta
   */
  async getResponseItems(responseIds: string[]): Promise<ResponseItem[]> {
    if (responseIds.length === 0) return [];

    const { data, error } = await supabase
      .from('response_items')
      .select('*')
      .in('response_id', responseIds);

    if (error) throw error;
    return data || [];
  },

  /**
   * Crear una respuesta
   */
  async createResponse(responseData: {
    survey_id: string;
    user_id?: string | null;
    submitted_at: string;
  }): Promise<Response> {
    const { data, error } = await supabase
      .from('responses')
      .insert(responseData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear items de respuesta
   */
  async createResponseItems(
    items: Array<{
      response_id: string;
      question_id: string;
      value_text?: string | null;
      value_numeric?: number | null;
      value_json?: Record<string, any> | null;
    }>
  ): Promise<void> {
    const { error } = await supabase.from('response_items').insert(items);

    if (error) throw error;
  },

  /**
   * Contar respuestas de una encuesta
   */
  async countSurveyResponses(surveyId: string): Promise<number> {
    const { count, error } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', surveyId);

    if (error) throw error;
    return count || 0;
  },
};

