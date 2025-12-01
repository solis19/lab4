import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { Survey, SurveyQuestionWithOptions } from '../types/database.types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';

export const SurveyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    if (id && user) {
      fetchSurvey();
    }
  }, [id, user]);

  const fetchSurvey = async () => {
    try {
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user?.id)
        .single();

      if (surveyError) throw surveyError;
      setSurvey(surveyData);

      // Construir URL pública
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/s/${surveyData.public_slug}`;
      setPublicUrl(url);

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
    } catch (error) {
      console.error('Error fetching survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!survey) return;

    try {
      const { error } = await supabase
        .from('surveys')
        .update({ status: 'published' })
        .eq('id', survey.id);

      if (error) throw error;
      setSurvey({ ...survey, status: 'published' });
    } catch (error) {
      console.error('Error publishing survey:', error);
    }
  };

  const handleClose = async () => {
    if (!survey) return;

    try {
      const { error } = await supabase
        .from('surveys')
        .update({ status: 'closed' })
        .eq('id', survey.id);

      if (error) throw error;
      setSurvey({ ...survey, status: 'closed' });
    } catch (error) {
      console.error('Error closing survey:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Encuesta no encontrada</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="text-sm">
            ← Volver
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 break-words">{survey.title}</h1>
              {survey.description && (
                <p className="mt-2 text-sm sm:text-base text-gray-600 break-words">{survey.description}</p>
              )}
            </div>
            <span
              className={`inline-flex px-3 py-1 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap self-start ${
                survey.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : survey.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {survey.status === 'published'
                ? 'Publicado'
                : survey.status === 'draft'
                ? 'Borrador'
                : 'Cerrado'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6">
            {survey.status === 'draft' && (
              <>
                <Button onClick={handlePublish} className="w-full sm:w-auto text-sm">Publicar Encuesta</Button>
                <Button variant="outline" onClick={() => navigate(`/surveys/${survey.id}/edit`)} className="w-full sm:w-auto text-sm">
                  Editar Encuesta
                </Button>
              </>
            )}
            {survey.status === 'published' && (
              <>
                <Button onClick={() => setShowQR(true)} className="w-full sm:w-auto text-sm">Ver Código QR</Button>
                <Button variant="danger" onClick={handleClose} className="w-full sm:w-auto text-sm">
                  Cerrar Encuesta
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => navigate(`/surveys/${survey.id}/results`)} className="w-full sm:w-auto text-sm">
              Ver Resultados
            </Button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Preguntas</h2>
          <div className="space-y-3 sm:space-y-4">
            {questions.map((question, index) => {
              // Determinar el color y texto del chip según el tipo
              const getTypeChip = (type: string) => {
                switch (type) {
                  case 'single':
                    return { label: 'Opción única', color: 'bg-blue-100 text-blue-800' };
                  case 'multiple':
                    return { label: 'Opción múltiple', color: 'bg-purple-100 text-purple-800' };
                  case 'text':
                    return { label: 'Texto libre', color: 'bg-green-100 text-green-800' };
                  case 'likert':
                    return { label: 'Escala Likert', color: 'bg-orange-100 text-orange-800' };
                  default:
                    return { label: type, color: 'bg-gray-100 text-gray-800' };
                }
              };

              const typeChip = getTypeChip(question.type);

              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start">
                    <span className="font-medium text-gray-900 mr-2 text-sm sm:text-base">{index + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base text-gray-900 mb-2 break-words">{question.question_text}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${typeChip.color}`}
                        >
                          {typeChip.label}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            question.required
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {question.required ? 'Obligatoria' : 'Opcional'}
                        </span>
                      </div>
                      {question.options_list && question.options_list.length > 0 && (
                        <ul className="mt-2 sm:mt-3 list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1">
                          {question.options_list.map((opt) => (
                            <li key={opt.id} className="break-words">{opt.label}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="Código QR de la Encuesta">
        <div className="flex flex-col items-center space-y-4 p-2">
          <QRCodeSVG value={publicUrl} size={Math.min(256, window.innerWidth - 100)} />
          <p className="text-xs sm:text-sm text-gray-600 text-center break-all px-2">{publicUrl}</p>
          <Button onClick={() => navigator.clipboard.writeText(publicUrl)} className="w-full sm:w-auto text-sm">
            Copiar URL
          </Button>
        </div>
      </Modal>
    </div>
  );
};

