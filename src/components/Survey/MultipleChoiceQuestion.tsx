import { SurveyQuestion, SurveyOption } from '../../types/database.types';

interface MultipleChoiceQuestionProps {
  question: SurveyQuestion;
  options: SurveyOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

export const MultipleChoiceQuestion = ({
  question,
  options,
  value,
  onChange,
}: MultipleChoiceQuestionProps) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {question.question_text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="checkbox"
              value={option.value}
              checked={value.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-900">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

