

export interface AbilityScores {
  STR: number;
  DEX: number;
  WIL: number;
}

export type Gender = 'Male' | 'Female' | 'Random';

export interface Character {
  name: string;
  gender: Gender;
  occupation: string;
  capability: string;
  abilities: AbilityScores;
  hp: number;
  wealth: number; // Shillings
  equipment: string[];
  arcanum?: {
    name: string;
    description: string;
  };
  oddity?: string; // Extracted from starter package if applicable (e.g. "Mute", "One Arm")
  description: string; // A summary string for the prompt
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  mood: string;
  characterName: string;
  timestamp: number;
}

export type GenerationStatus = 'idle' | 'enhancing' | 'generating' | 'complete' | 'error';

export interface APIError {
  message: string;
  code?: string;
}

export type ApiProvider = 'gemini' | 'flash' | 'flux' | 'turbo';
