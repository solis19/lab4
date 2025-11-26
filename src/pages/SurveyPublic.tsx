import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import {
  Survey,
  SurveyQuestion,
  SurveyOption,
  SurveyQuestionWithOptions,
} from '../types/database.types';
import { TextQuestion } from '../components/Survey/TextQuestion';
import { SingleChoiceQuestion } from '../components/Survey/SingleChoiceQuestion';
import { MultipleChoiceQuestion } from '../components/Survey/MultipleChoiceQuestion';
import { LikertQuestion } from '../components/Survey/LikertQuestion';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const SurveyPublic = () => {
  const { publicSlug } = useParams<{ publicSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestionWithOptions[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (publicSlug) {
      fetchSurvey();
    }
  }, [publicSlug]);

  const fetchSurvey = async () => {
    try {
      // Obtener encuesta por public_slug
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('public_slug', publicSlug)
        .eq('status', 'published')
        .single();

      if (surveyError) throw surveyError;
      if (!surveyData) {
        setError('Encuesta no encontrada o no está publicada');
        setLoading(false);
        return;
      }

      setSurvey(surveyData);

      // Obtener preguntas
      const { data: questionsData, error: questionsError } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', surveyData.id)
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

      setQuestions(questionsWithOptions);

      // Inicializar respuestas
      const initialResponses: Record<string, any> = {};
      questionsWithOptions.forEach((q) => {
        if (q.type === 'multiple') {
          initialResponses[q.id] = [];
        } else if (q.type === 'likert' || q.type === 'single') {
          initialResponses[q.id] = null;
        } else {
          initialResponses[q.id] = '';
        }
      });
      setResponses(initialResponses);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar campos requeridos
    const requiredQuestions = questions.filter((q) => q.required);
    for (const q of requiredQuestions) {
      const response = responses[q.id];
      if (
        response === null ||
        response === '' ||
        (Array.isArray(response) && response.length === 0)
      ) {
        setError(`La pregunta "${q.question_text}" es obligatoria`);
        return;
      }
    }

    if (!survey) return;

    setSubmitting(true);

    try {
      // Crear respuesta
      const { data: response, error: responseError } = await supabase
        .from('responses')
        .insert({
          survey_id: survey.id,
          user_id: user?.id || null,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Crear items de respuesta
      const responseItems = questions.map((q) => {
        const responseValue = responses[q.id];
        let value_text = null;
        let value_numeric = null;
        let value_json = null;

        if (q.type === 'text') {
          value_text = responseValue;
        } else if (q.type === 'likert' || q.type === 'single') {
          if (q.type === 'likert') {
            value_numeric = responseValue;
          } else {
            value_text = responseValue;
          }
        } else if (q.type === 'multiple') {
          value_json = { selected: responseValue };
        }

        return {
          response_id: response.id,
          question_id: q.id,
          value_text,
          value_numeric,
          value_json,
        };
      });

      const { error: itemsError } = await supabase
        .from('response_items')
        .insert(responseItems);

      if (itemsError) throw itemsError;

      // Mostrar mensaje de éxito y redirigir
      alert('¡Gracias por completar la encuesta!');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al enviar la respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!survey) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-600 mb-8">{survey.description}</p>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question) => {
              const responseValue = responses[question.id];

              if (question.type === 'text') {
                return (
                  <TextQuestion
                    key={question.id}
                    question={question}
                    value={responseValue || ''}
                    onChange={(value) =>
                      setResponses({ ...responses, [question.id]: value })
                    }
                  />
                );
              }

              if (question.type === 'single') {
                return (
                  <SingleChoiceQuestion
                    key={question.id}
                    question={question}
                    options={question.options_list || []}
                    value={responseValue || ''}
                    onChange={(value) =>
                      setResponses({ ...responses, [question.id]: value })
                    }
                  />
                );
              }

              if (question.type === 'multiple') {
                return (
                  <MultipleChoiceQuestion
                    key={question.id}
                    question={question}
                    options={question.options_list || []}
                    value={responseValue || []}
                    onChange={(value) =>
                      setResponses({ ...responses, [question.id]: value })
                    }
                  />
                );
              }

              if (question.type === 'likert') {
                return (
                  <LikertQuestion
                    key={question.id}
                    question={question}
                    value={responseValue}
                    onChange={(value) =>
                      setResponses({ ...responses, [question.id]: value })
                    }
                  />
                );
              }

              return null;
            })}

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={submitting}>
                Enviar Respuesta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

