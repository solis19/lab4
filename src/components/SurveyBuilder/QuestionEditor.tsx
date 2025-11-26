import { useState, useEffect } from 'react';
import { SurveyQuestion, SurveyOption } from '../../types/database.types';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { OptionsEditor } from './OptionsEditor';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface QuestionEditorProps {
  question: Partial<SurveyQuestion> & { options_list?: SurveyOption[] };
  onChange: (question: Partial<SurveyQuestion> & { options_list?: SurveyOption[] }) => void;
  onDelete: () => void;
}

export const QuestionEditor = ({ question, onChange, onDelete }: QuestionEditorProps) => {
  const [localQuestion, setLocalQuestion] = useState(question);

  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  const updateQuestion = (updates: Partial<SurveyQuestion>) => {
    const updated = { ...localQuestion, ...updates };
    setLocalQuestion(updated);
    onChange(updated);
  };

  const needsOptions = localQuestion.type === 'single' || localQuestion.type === 'multiple';

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">
          Pregunta {question.position !== undefined ? question.position + 1 : ''}
        </h3>
        <Button variant="danger" size="sm" onClick={onDelete}>
          Eliminar
        </Button>
      </div>

      <QuestionTypeSelector
        value={localQuestion.type || ''}
        onChange={(type) => updateQuestion({ type })}
      />

      <Input
        label="Texto de la pregunta"
        value={localQuestion.question_text || ''}
        onChange={(e) => updateQuestion({ question_text: e.target.value })}
        placeholder="Escribe tu pregunta aquí"
        required
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${question.id || 'new'}`}
          checked={localQuestion.required || false}
          onChange={(e) => updateQuestion({ required: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor={`required-${question.id || 'new'}`}
          className="ml-2 block text-sm text-gray-900"
        >
          Pregunta obligatoria
        </label>
      </div>

      {needsOptions && (
        <OptionsEditor
          options={localQuestion.options_list || []}
          onChange={(options) => onChange({ ...localQuestion, options_list: options })}
        />
      )}

      {localQuestion.type === 'likert' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Configuración de Escala Likert
          </label>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Tipo de escala
            </label>
            <select
              value={localQuestion.options?.isCustom ? 'custom' : localQuestion.options?.scale || 5}
              onChange={(e) => {
                const value = e.target.value;
                
                if (value === 'custom') {
                  // Modo personalizado - empezar con 5 opciones vacías
                  updateQuestion({
                    options: { 
                      scale: 5, 
                      labels: ['', '', '', '', ''],
                      isCustom: true
                    }
                  });
                } else {
                  const scale = parseInt(value);
                  const labels = scale === 3 
                    ? ['En desacuerdo', 'Neutral', 'De acuerdo']
                    : scale === 5
                    ? ['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo']
                    : scale === 7
                    ? ['Totalmente en desacuerdo', 'En desacuerdo', 'Algo en desacuerdo', 'Neutral', 'Algo de acuerdo', 'De acuerdo', 'Totalmente de acuerdo']
                    : [];
                  
                  updateQuestion({
                    options: { scale, labels, isCustom: false }
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3">3 puntos</option>
              <option value="5">5 puntos (recomendado)</option>
              <option value="7">7 puntos</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>

          {localQuestion.options?.isCustom ? (
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Etiquetas personalizadas:
              </label>
              <div className="space-y-2">
                {(localQuestion.options?.labels || []).map((label: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-8">{index + 1}.</span>
                    <Input
                      value={label}
                      onChange={(e) => {
                        const newLabels = [...(localQuestion.options?.labels || [])];
                        newLabels[index] = e.target.value;
                        updateQuestion({
                          options: { 
                            ...localQuestion.options,
                            labels: newLabels 
                          }
                        });
                      }}
                      placeholder={`Etiqueta para opción ${index + 1}`}
                      className="flex-1"
                    />
                    {index === (localQuestion.options?.labels || []).length - 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newLabels = [...(localQuestion.options?.labels || []), ''];
                          updateQuestion({
                            options: { 
                              scale: newLabels.length,
                              labels: newLabels,
                              isCustom: true
                            }
                          });
                        }}
                      >
                        +
                      </Button>
                    )}
                    {(localQuestion.options?.labels || []).length > 2 && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          const newLabels = (localQuestion.options?.labels || []).filter((_: string, i: number) => i !== index);
                          updateQuestion({
                            options: { 
                              scale: newLabels.length,
                              labels: newLabels,
                              isCustom: true
                            }
                          });
                        }}
                      >
                        X
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Mínimo 2 opciones. Haz clic en "+" para agregar más.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Vista previa de las etiquetas:
              </label>
              <div className="space-y-1 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                {(localQuestion.options?.labels || [
                  'Muy en desacuerdo',
                  'En desacuerdo',
                  'Neutral',
                  'De acuerdo',
                  'Muy de acuerdo',
                ]).map((label: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-medium">{index + 1}.</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

