import { SurveyQuestion } from '../../types/database.types';

interface TextQuestionProps {
  question: SurveyQuestion;
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestion = ({ question, value, onChange }: TextQuestionProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {question.question_text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={question.required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        placeholder="Escribe tu respuesta aquí"
      />
    </div>
  );
};

