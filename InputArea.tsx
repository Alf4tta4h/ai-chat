import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, FileCode, Image as ImageIcon, Mic, Square } from 'lucide-react';

interface InputAreaProps {
  onSubmit: (input: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStartListening: () => void;
  isLoading: boolean;
  isGenerating: boolean;
  isListening: boolean;
  onStopGeneration: () => void;
  placeholderText: string;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSubmit,
  onFileUpload,
  onImageUpload,
  onStartListening,
  isLoading,
  isGenerating,
  isListening,
  onStopGeneration,
  placeholderText
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <footer className="bg-[var(--color-secondary)] p-4 border-t border-[var(--color-border)]">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="bolt-input resize-none overflow-hidden"
            style={{ minHeight: '40px', maxHeight: '200px' }}
            rows={1}
            disabled={isLoading}
          />
        </div>
        <label className="cursor-pointer bolt-button">
          <FileCode className="w-5 h-5" />
          <input
            type="file"
            className="hidden"
            onChange={onFileUpload}
            accept=".js,.py,.html,.css,.txt"
          />
        </label>
        <label className="cursor-pointer bolt-button">
          <ImageIcon className="w-5 h-5" />
          <input
            type="file"
            className="hidden"
            onChange={onImageUpload}
            accept="image/*"
          />
        </label>
        <button
          type={isGenerating ? "button" : "submit"}
          className="bolt-button"
          onClick={isGenerating ? onStopGeneration : undefined}
          disabled={isLoading && !isGenerating}
        >
          {isGenerating ? (
            <Square className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onStartListening}
          className={`bolt-button ${isListening ? 'animate-pulse' : ''}`}
        >
          <Mic className="w-5 h-5" />
        </button>
      </form>
    </footer>
  );
};
