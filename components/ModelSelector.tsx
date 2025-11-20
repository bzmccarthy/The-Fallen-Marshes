
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
            title="Fast, High Fidelity. Uses your API Key quota."
        >
            Gemini
        </button>
        <div className="w-px bg-odd-border"></div>
        <button
            onClick={() => onChange('flux')}
            disabled={disabled}
            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${
                current === 'flux' 
                ? 'bg-odd-accent text-odd-bg' 
                : 'text-odd-muted hover:text-odd-text hover:bg-white/5'
            }`}
            title="Slower, Artistic. Uses Flux model."
        >
            Flux
        </button>
        <div className="w-px bg-odd-border"></div>
        <button
            onClick={() => onChange('turbo')}
            disabled={disabled}
            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${
                current === 'turbo' 
                ? 'bg-odd-accent text-odd-bg' 
                : 'text-odd-muted hover:text-odd-text hover:bg-white/5'
            }`}
            title="Instant, Low Fidelity. Uses Turbo model."
        >
            Turbo
        </button>
        <div className="w-px bg-odd-border"></div>
        <button
            onClick={() => onChange('search')}
            disabled={disabled}
            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${
                current === 'search' 
                ? 'bg-odd-accent text-odd-bg' 
                : 'text-odd-muted hover:text-odd-text hover:bg-white/5'
            }`}
            title="Uses Google Search to find existing images."
        >
            Search
        </button>
      </div>
    </div>
  );
};
