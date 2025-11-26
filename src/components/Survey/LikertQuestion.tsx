import { SurveyQuestion } from '../../types/database.types';

interface LikertQuestionProps {
  question: SurveyQuestion;
  value: number | null;
  onChange: (value: number) => void;
}

export const LikertQuestion = ({ question, value, onChange }: LikertQuestionProps) => {
  const scale = (question.options as any)?.scale || 5;
  const labels = (question.options as any)?.labels || [
    'Muy en desacuerdo',
    'En desacuerdo',
    'Neutral',
    'De acuerdo',
    'Muy de acuerdo',
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {question.question_text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {Array.from({ length: scale }, (_, i) => i + 1).map((num) => (
          <label
            key={num}
            className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={num}
              checked={value === num}
              onChange={(e) => onChange(parseInt(e.target.value))}
              required={question.required}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-sm text-gray-900">
              {num} - {labels[num - 1] || `Opción ${num}`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

