import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { Survey, SurveyQuestion, SurveyOption, ResponseItem } from '../types/database.types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

interface TextResponse {
  response_id: string;
  user_id: string | null;
  user_email: string | null;
  value_text: string;
  submitted_at: string;
}

export const SurveyResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Array<SurveyQuestion & { options_list?: SurveyOption[] }>>([]);
  const [responseItems, setResponseItems] = useState<ResponseItem[]>([]);
  const [textResponses, setTextResponses] = useState<Record<string, TextResponse[]>>({});
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchResults();
    }
  }, [id, user]);

  const fetchResults = async () => {
    try {
      // Obtener encuesta
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user?.id)
        .single();

      if (surveyError) throw surveyError;
      setSurvey(surveyData);

      // Obtener preguntas
      const { data: questionsData, error: questionsError } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', surveyData.id)
        .order('position');

      if (questionsError) throw questionsError;

      // Obtener opciones
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

      setQuestions(questionsWithOptions);

      // Obtener respuestas con toda la información
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('survey_id', surveyData.id);

      if (responsesError) throw responsesError;
      setTotalResponses(responsesData?.length || 0);

      // Obtener items de respuesta con información de usuario
      if (responsesData && responsesData.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('response_items')
          .select('*')
          .in('response_id', responsesData.map((r) => r.id));

        if (itemsError) throw itemsError;
        setResponseItems(itemsData || []);

        // Obtener respuestas de texto con información del usuario
        const textResponsesMap: Record<string, TextResponse[]> = {};
        
        for (const question of questionsWithOptions) {
          if (question.type === 'text') {
            const textItems = (itemsData || []).filter(
              (item) => item.question_id === question.id && item.value_text
            );

            const textResponsesWithUser = await Promise.all(
              textItems.map(async (item) => {
                // Obtener información de la respuesta
                const response = responsesData.find((r) => r.id === item.response_id);
                
                // Obtener el email del usuario si existe
                let userEmail = null;
                if (response?.user_id) {
                  const { data: emailData } = await supabase.rpc('get_user_email', { 
                    user_uuid: response.user_id 
                  });
                  userEmail = emailData;
                }
                
                return {
                  response_id: item.response_id,
                  user_id: response?.user_id || null,
                  user_email: userEmail,
                  value_text: item.value_text || '',
                  submitted_at: response?.submitted_at || new Date().toISOString(),
                };
              })
            );

            textResponsesMap[question.id] = textResponsesWithUser;
          }
        }

        setTextResponses(textResponsesMap);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionData = (question: SurveyQuestion & { options_list?: SurveyOption[] }) => {
    const items = responseItems.filter((item) => item.question_id === question.id);

    if (question.type === 'single' || question.type === 'multiple') {
      const counts: Record<string, number> = {};
      question.options_list?.forEach((opt) => {
        counts[opt.label] = 0;
      });

      items.forEach((item) => {
        if (question.type === 'single' && item.value_text) {
          const option = question.options_list?.find((opt) => opt.value === item.value_text);
          if (option) {
            counts[option.label] = (counts[option.label] || 0) + 1;
          }
        } else if (question.type === 'multiple' && item.value_json) {
          const selected = (item.value_json as any).selected || [];
          selected.forEach((val: string) => {
            const option = question.options_list?.find((opt) => opt.value === val);
            if (option) {
              counts[option.label] = (counts[option.label] || 0) + 1;
            }
          });
        }
      });

      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    if (question.type === 'likert') {
      // Obtener configuración de la escala desde las opciones de la pregunta
      const scale = question.options?.scale || 5;
      const likertLabels = question.options?.labels || [
        'Muy en desacuerdo',
        'En desacuerdo',
        'Neutral',
        'De acuerdo',
        'Muy de acuerdo',
      ];

      // Inicializar contadores para todas las opciones de la escala
      const counts: Record<number, number> = {};
      for (let i = 1; i <= scale; i++) {
        counts[i] = 0;
      }
      
      items.forEach((item) => {
        if (item.value_numeric && item.value_numeric >= 1 && item.value_numeric <= scale) {
          counts[item.value_numeric] = (counts[item.value_numeric] || 0) + 1;
        }
      });

      return Object.entries(counts).map(([scaleValue, value]) => ({
        name: likertLabels[parseInt(scaleValue) - 1] || `Opción ${scaleValue}`,
        value,
      }));
    }

    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(`/surveys/${id}`)}>
            ← Volver
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Resultados: {survey?.title}
          </h1>
          <p className="text-gray-600">Total de respuestas: {totalResponses}</p>
        </div>

        <div className="space-y-8">
          {questions.map((question) => {
            const data = getQuestionData(question);

            return (
              <div key={question.id} className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {question.question_text}
                </h2>

                {question.type !== 'text' ? (
                  data.length > 0 ? (
                    <div style={{ height: Math.max(300, data.length * 80) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30, top: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            type="number" 
                            label={{ value: 'Número de respuestas', position: 'insideBottom', offset: -10 }}
                          />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={200}
                            tick={{ fontSize: 13 }}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${value} respuesta(s)`, '']}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hay respuestas para esta pregunta aún
                    </p>
                  )
                ) : (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Respuestas de texto ({textResponses[question.id]?.length || 0}):
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {textResponses[question.id]?.length > 0 ? (
                        textResponses[question.id].map((response, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-medium text-gray-500">
                                {response.user_email ? (
                                  <>Usuario: {response.user_email}</>
                                ) : (
                                  'Anónimo'
                                )}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(response.submitted_at).toLocaleString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900">{response.value_text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No hay respuestas para esta pregunta aún
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

