import { supabase } from '../lib/supabaseClient';
import { SurveyQuestion, SurveyOption, QuestionType } from '../types/database.types';

export const questionService = {
  /**
   * Obtener todas las preguntas de una encuesta
   */
  async getSurveyQuestions(
    surveyId: string
  ): Promise<Array<SurveyQuestion & { options_list?: SurveyOption[] }>> {
    const { data: questionsData, error: questionsError } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('position');

    if (questionsError) throw questionsError;

    // Obtener opciones para cada pregunta
    const questionsWithOptions = await Promise.all(
      (questionsData || []).map(async (q) => {
        if (q.type === 'single' || q.type === 'multiple') {
          const { data: optionsData } = await supabase
            .from('survey_options')
            .select('*')
            .eq('question_id', q.id)
            .order('position');

          return { ...q, options_list: optionsData || [] };
        }
        return { ...q, options_list: [] };
      })
    );

    return questionsWithOptions;
  },

  /**
   * Crear una pregunta
   */
  async createQuestion(questionData: {
    survey_id: string;
    type: QuestionType;
    question_text: string;
    required: boolean;
    options: Record<string, any> | null;
    position: number;
  }): Promise<SurveyQuestion> {
    const { data, error } = await supabase
      .from('survey_questions')
      .insert(questionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar una pregunta
   */
  async updateQuestion(
    questionId: string,
    updates: Partial<SurveyQuestion>
  ): Promise<void> {
    const { error } = await supabase
      .from('survey_questions')
      .update(updates)
      .eq('id', questionId);

    if (error) throw error;
  },

  /**
   * Eliminar una pregunta (primero elimina sus opciones)
   */
  async deleteQuestion(questionId: string): Promise<void> {
    // Primero eliminar las opciones asociadas
    const { error: optionsError } = await supabase
      .from('survey_options')
      .delete()
      .eq('question_id', questionId);

    if (optionsError) throw optionsError;

    // Luego eliminar la pregunta
    const { error } = await supabase
      .from('survey_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
  },

  /**
   * Crear opciones para una pregunta
   */
  async createOptions(
    options: Array<{
      question_id: string;
      label: string;
      value: string;
      position: number;
    }>
  ): Promise<void> {
    const { error } = await supabase.from('survey_options').insert(options);

    if (error) throw error;
  },

  /**
   * Obtener opciones de una pregunta
   */
  async getQuestionOptions(questionId: string): Promise<SurveyOption[]> {
    const { data, error } = await supabase
      .from('survey_options')
      .select('*')
      .eq('question_id', questionId)
      .order('position');

    if (error) throw error;
    return data || [];
  },
};

