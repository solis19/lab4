import { supabase } from '../lib/supabaseClient';
import { Survey, SurveyQuestion, SurveyOption } from '../types/database.types';

export interface SurveyWithQuestions extends Survey {
  questions?: Array<SurveyQuestion & { options_list?: SurveyOption[] }>;
}

export const surveyService = {
  /**
   * Obtener todas las encuestas de un usuario
   */
  async getUserSurveys(userId: string): Promise<Survey[]> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtener una encuesta por ID
   */
  async getSurveyById(surveyId: string): Promise<Survey | null> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtener una encuesta por slug público
   */
  async getSurveyByPublicSlug(publicSlug: string): Promise<Survey | null> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('public_slug', publicSlug)
      .eq('status', 'published')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear una nueva encuesta
   */
  async createSurvey(surveyData: {
    owner_id: string;
    title: string;
    description?: string;
    status: string;
    public_slug: string;
    slug: string;
  }): Promise<Survey> {
    const { data, error } = await supabase
      .from('surveys')
      .insert(surveyData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar una encuesta
   */
  async updateSurvey(
    surveyId: string,
    updates: Partial<Survey>
  ): Promise<void> {
    const { error } = await supabase
      .from('surveys')
      .update(updates)
      .eq('id', surveyId);

    if (error) throw error;
  },

  /**
   * Eliminar una encuesta
   */
  async deleteSurvey(surveyId: string): Promise<void> {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);

    if (error) throw error;
  },

  /**
   * Obtener estadísticas de encuestas de un usuario
   */
  async getUserSurveyStats(userId: string) {
    // Total de encuestas
    const { count: totalSurveys } = await supabase
      .from('surveys')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    // Encuestas activas (publicadas)
    const { count: activeSurveys } = await supabase
      .from('surveys')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'published');

    // Obtener IDs de encuestas del usuario
    const { data: surveys } = await supabase
      .from('surveys')
      .select('id')
      .eq('owner_id', userId);

    // Total de respuestas
    let totalResponses = 0;
    if (surveys && surveys.length > 0) {
      const { data: responsesData } = await supabase
        .from('responses')
        .select('id')
        .in(
          'survey_id',
          surveys.map((s) => s.id)
        );

      totalResponses = responsesData?.length || 0;
    }

    return {
      totalSurveys: totalSurveys || 0,
      activeSurveys: activeSurveys || 0,
      totalResponses,
    };
  },

  /**
   * Obtener evolución de respuestas en los últimos 7 días
   */
  async getResponsesTimeline(userId: string) {
    // Obtener IDs de encuestas del usuario
    const { data: surveys } = await supabase
      .from('surveys')
      .select('id')
      .eq('owner_id', userId);

    if (!surveys || surveys.length === 0) {
      return [];
    }

    // Obtener respuestas de los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: responses } = await supabase
      .from('responses')
      .select('submitted_at')
      .in('survey_id', surveys.map(s => s.id))
      .gte('submitted_at', sevenDaysAgo.toISOString())
      .order('submitted_at', { ascending: true });

    // Agrupar por día
    const timeline: { [key: string]: number } = {};
    
    // Inicializar los últimos 7 días con 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      timeline[dateStr] = 0;
    }

    // Contar respuestas por día
    responses?.forEach(response => {
      const dateStr = response.submitted_at.split('T')[0];
      if (timeline[dateStr] !== undefined) {
        timeline[dateStr]++;
      }
    });

    // Convertir a array para el gráfico
    return Object.entries(timeline).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
      respuestas: count
    }));
  },
};

