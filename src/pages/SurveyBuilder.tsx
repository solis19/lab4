import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SurveyQuestion, SurveyOption } from '../types/database.types';
import { QuestionEditor } from '../components/SurveyBuilder/QuestionEditor';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { surveyService, questionService } from '../services';

export const SurveyBuilder = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<
    Array<Partial<SurveyQuestion> & { options_list?: SurveyOption[] }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id && user) {
      loadSurvey();
    }
  }, [id, user]);

  const loadSurvey = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // Cargar encuesta
      const survey = await surveyService.getSurveyById(id);
      if (!survey || survey.owner_id !== user?.id) {
        throw new Error('Encuesta no encontrada');
      }

      if (survey.status !== 'draft') {
        throw new Error('Solo se pueden editar encuestas en borrador');
      }

      setTitle(survey.title);
      setDescription(survey.description || '');
      setIsEditing(true);

      // Cargar preguntas
      const questionsData = await questionService.getSurveyQuestions(id);
      setQuestions(questionsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la encuesta');
      setTimeout(() => navigate('/dashboard'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const addQuestion = () => {
    const newQuestion: Partial<SurveyQuestion> & { options_list?: SurveyOption[] } = {
      type: undefined,
      question_text: '',
      required: false,
      options_list: [],
      position: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, question: Partial<SurveyQuestion> & { options_list?: SurveyOption[] }) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...question, position: index };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, position: i })));
  };

  const handleSave = async () => {
    if (!user) return;

    setError('');
    setIsSaving(true);

    try {
      // Validaciones
      if (!title.trim()) {
        throw new Error('El título es requerido');
      }

      if (questions.length === 0) {
        throw new Error('Debes agregar al menos una pregunta');
      }

      const validQuestions = questions.filter(
        (q) => q.type && q.question_text?.trim()
      );

      if (validQuestions.length === 0) {
        throw new Error('Debes completar al menos una pregunta');
      }

      let surveyId: string;

      if (isEditing && id) {
        // MODO EDICIÓN: Actualizar encuesta existente
        await surveyService.updateSurvey(id, {
          title: title.trim(),
          description: description.trim() || undefined,
        });

        // Eliminar preguntas y opciones antiguas
        const oldQuestions = await questionService.getSurveyQuestions(id);
        for (const oldQ of oldQuestions) {
          await questionService.deleteQuestion(oldQ.id);
        }

        surveyId = id;
      } else {
        // MODO CREACIÓN: Crear nueva encuesta
        const baseSlug = generateSlug(title);
        const publicSlug = `${baseSlug}-${Date.now()}`;

        const survey = await surveyService.createSurvey({
          owner_id: user.id,
          title: title.trim(),
          description: description.trim() || undefined,
          status: 'draft',
          public_slug: publicSlug,
          slug: baseSlug,
        });

        surveyId = survey.id;
      }

      // Crear preguntas y opciones (igual para ambos modos)
      for (let i = 0; i < validQuestions.length; i++) {
        const q = validQuestions[i];

        // Preparar opciones JSON para Likert
        let optionsJson = null;
        if (q.type === 'likert') {
          // Usar configuración personalizada o valores por defecto
          optionsJson = q.options || {
            scale: 5,
            labels: ['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo'],
          };
        } else if (q.options) {
          optionsJson = q.options;
        }

        // Crear pregunta
        const question = await questionService.createQuestion({
          survey_id: surveyId,
          type: q.type!,
          question_text: q.question_text!.trim(),
          required: q.required || false,
          options: optionsJson,
          position: i,
        });

        // Crear opciones si es necesario
        if ((q.type === 'single' || q.type === 'multiple') && q.options_list && q.options_list.length > 0) {
          const optionsToInsert = q.options_list.map((opt, optIndex) => ({
            question_id: question.id,
            label: opt.label,
            value: opt.value,
            position: optIndex,
          }));

          await questionService.createOptions(optionsToInsert);
        }
      }

      navigate(`/surveys/${surveyId}`);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la encuesta');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {isEditing ? 'Editar Encuesta' : 'Crear Nueva Encuesta'}
        </h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <Input
            label="Título de la encuesta"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Encuesta de satisfacción"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el propósito de esta encuesta"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Preguntas</h2>
              <Button onClick={addQuestion} size="sm">
                Agregar Pregunta
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay preguntas aún. Haz clic en "Agregar Pregunta" para comenzar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <QuestionEditor
                    key={index}
                    question={question}
                    onChange={(updated) => updateQuestion(index, updated)}
                    onDelete={() => deleteQuestion(index)}
                  />
                ))}
                
                {/* Botón adicional al final de las preguntas */}
                <div className="flex justify-center pt-4">
                  <Button onClick={addQuestion} variant="outline" size="sm">
                    + Agregar Otra Pregunta
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {isEditing ? 'Actualizar Encuesta' : 'Guardar Encuesta'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

