import { useState } from 'react';
import { SurveyOption } from '../../types/database.types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface OptionsEditorProps {
  options: SurveyOption[];
  onChange: (options: SurveyOption[]) => void;
}

export const OptionsEditor = ({ options, onChange }: OptionsEditorProps) => {
  const [newOptionLabel, setNewOptionLabel] = useState('');

  const generateValue = (label: string): string => {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '');
  };

  const addOption = () => {
    if (!newOptionLabel.trim()) return;

    const option: SurveyOption = {
      id: `temp-${Date.now()}`,
      question_id: '',
      label: newOptionLabel.trim(),
      value: generateValue(newOptionLabel.trim()),
      position: options.length,
    };

    onChange([...options, option]);
    setNewOptionLabel('');
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, label: string) => {
    const updated = [...options];
    updated[index] = {
      ...updated[index],
      label: label,
      value: generateValue(label),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Opciones de respuesta
      </label>

      {options.map((option, index) => (
        <div key={option.id || index} className="flex gap-2 items-center">
          <Input
            value={option.label}
            onChange={(e) => updateOption(index, e.target.value)}
            placeholder="Texto de la opción"
            className="flex-1"
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => removeOption(index)}
          >
            X
          </Button>
        </div>
      ))}

      <div className="flex gap-2">
        <Input
          value={newOptionLabel}
          onChange={(e) => setNewOptionLabel(e.target.value)}
          placeholder="Nueva opción"
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addOption();
            }
          }}
        />
        <Button onClick={addOption} size="sm">
          Agregar
        </Button>
      </div>
    </div>
  );
};

