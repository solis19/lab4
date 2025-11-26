import { QuestionType } from '../../types/database.types';

interface QuestionTypeSelectorProps {
  value: QuestionType | '';
  onChange: (type: QuestionType) => void;
}

export const QuestionTypeSelector = ({ value, onChange }: QuestionTypeSelectorProps) => {
  const types: { value: QuestionType; label: string; description: string }[] = [
    { value: 'text', label: 'Texto', description: 'Respuesta de texto libre' },
    { value: 'single', label: 'Opción única', description: 'Selección de una opción' },
    { value: 'multiple', label: 'Opción múltiple', description: 'Selección de varias opciones' },
    { value: 'likert', label: 'Escala Likert', description: 'Escala de valoración' },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Tipo de pregunta
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as QuestionType)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Selecciona un tipo</option>
        {types.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label} - {type.description}
          </option>
        ))}
      </select>
    </div>
  );
};

