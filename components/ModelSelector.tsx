import React from 'react';
import { ApiProvider } from '../types';

interface ModelSelectorProps {
  current: ApiProvider;
  onChange: (provider: ApiProvider) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ current, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-2 bg-odd-panel/50 p-1 rounded border border-odd-border self-start md:self-auto">
      <span className="text-[10px] uppercase font-bold text-odd-muted pl-2">Visual Cortex:</span>
      <div className="flex bg-odd-dark rounded border border-odd-border/50">
        <button
            onClick={() => onChange('gemini')}
            disabled={disabled}
            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${
                current === 'gemini' 
                ? 'bg-odd-accent text-odd-bg' 
                : 'text-odd-muted hover:text-odd-text hover:bg-white/5'
            }`}
            title="Fast, High Quality. Uses your API Key quota."
        >
            Gemini
        </button>
        <div className="w-px bg-odd-border"></div>
        <button
            onClick={() => onChange('pollinations')}
            disabled={disabled}
            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${
                current === 'pollinations' 
                ? 'bg-odd-accent text-odd-bg' 
                : 'text-odd-muted hover:text-odd-text hover:bg-white/5'
            }`}
            title="Unlimited, Slower. Uses Flux model via Pollinations.ai."
        >
            Flux
        </button>
      </div>
    </div>
  );
};