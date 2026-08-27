import React, { useState } from 'react';
import { Tag, Plus, X, AlertCircle } from 'lucide-react';

interface TagListInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  subtitle?: string;
  maxItems?: number;
  error?: string;
}

export const TagListInput: React.FC<TagListInputProps> = ({
  label,
  items,
  onChange,
  placeholder = 'Type and press Enter or comma...',
  subtitle,
  maxItems = 10,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const addItem = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Validation: Maximum limits
    if (items.length >= maxItems) {
      setLocalError(`Maximum ${maxItems} items allowed`);
      return;
    }

    // Validation: Duplicate entries
    if (items.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setLocalError('Item already added');
      return;
    }

    onChange([...items, trimmed]);
    setInputValue('');
    setLocalError(null);
  };

  const removeItem = (indexToRemove: number) => {
    onChange(items.filter((_, index) => index !== indexToRemove));
    setLocalError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addItem(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && items.length > 0) {
      removeItem(items.length - 1);
    }
  };

  return (
    <div className="w-full">
      {/* Label & Header */}
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs text-gray-500 font-mono">
          {items.length}/{maxItems}
        </span>
      </div>

      {subtitle && (
        <p className="text-xs text-gray-400 mb-2">{subtitle}</p>
      )}

      {/* Input Container */}
      <div
        className={`min-h-[46px] p-2 bg-gray-950 border ${
          error || localError ? 'border-red-500/80' : 'border-gray-800 focus-within:border-indigo-500/80'
        } rounded-xl flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all`}
      >
        {/* Render Active String Tags */}
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 border border-indigo-800/50 text-indigo-300 text-xs font-medium rounded-lg group animate-fadeIn"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-indigo-400/60 hover:text-indigo-200 hover:bg-indigo-900/50 rounded p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Text Input */}
        <div className="flex-1 flex items-center min-w-[140px] relative">
          <Tag className="w-4 h-4 text-gray-500 ml-1 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (localError) setLocalError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => addItem(inputValue)}
            placeholder={items.length === 0 ? placeholder : 'Add another...'}
            className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addItem(inputValue)}
              className="p-1 text-gray-400 hover:text-indigo-400"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Messaging */}
      {(error || localError) && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error || localError}
        </p>
      )}
    </div>
  );
}