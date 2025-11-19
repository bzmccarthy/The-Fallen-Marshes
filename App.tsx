import React, { useState } from 'react';
import { CharacterSheet } from './components/CharacterSheet';
import { ImageDisplay } from './components/ImageDisplay';
import { enhancePrompt, generateCharacterPortrait } from './services/geminiService';
import { generateCharacter } from './services/characterGenerator';
import { Character, GeneratedImage, GenerationStatus, Gender } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

// distinct artistic styles to ensure variety
const TARGET_MOODS = [
    'Grim Engraving', 
    'Desaturated Oil', 
    'Ethereal Watercolor', 
    'Vintage Daguerreotype'
];

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRollAndGenerate = async (gender: Gender) => {
    try {
      setError(null);
      setGeneratedImages([]); 
      setStatus('generating'); 
      
      // 1. Generate Character Logic
      const newChar = generateCharacter(gender);
      setCharacter(newChar);

      setStatus('enhancing');
      setStatusMessage(`Visualizing ${newChar.name}...`);

      // 2. Generate Portraits based on new char
      const promises = TARGET_MOODS.map(async (mood) => {
          try {
            const enhancedPrompt = await enhancePrompt(newChar, mood);
            const imageUrl = await generateCharacterPortrait(enhancedPrompt);
            
            return {
              id: generateId(),
              url: imageUrl,
              prompt: enhancedPrompt,
              mood: mood,
              characterName: newChar.name,
              timestamp: Date.now(),
            } as GeneratedImage;
          } catch (e) {
            console.error(`Failed to generate mood ${mood}:`, e);
            // We return null here and filter it out later
            return null;
          }
      });

      setStatus('generating');
      const results = await Promise.all(promises);
      
      // Filter out failed requests
      const successfulImages = results.filter((img): img is GeneratedImage => img !== null);

      if (successfulImages.length === 0) {
        throw new Error("All portrait attempts failed. The ether is thick today (API Safety or Network Error).");
      }

      setGeneratedImages(successfulImages);
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err.message || 'The ether is clouded. The portraiture machine malfunctioned.');
    }
  };

  return (
    <div className="min-h-screen font-sans text-odd-text selection:bg-odd-accent selection:text-white pb-32">
        <div className="fixed inset-0 pointer-events-none z-50 scanline opacity-20"></div>

      <header className="border-b-4 border-double border-odd-border bg-odd-dark/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tighter text-odd-accent uppercase shadow-black drop-shadow-md">
              Odd Portraiture
            </h1>
            <p className="text-xs md:text-sm text-odd-muted tracking-widest uppercase mt-1">
              Automatic Character & Likeness Generator
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column: Character Sheet */}
          <div className="md:col-span-5 space-y-8 mb-8 md:mb-0">
            <div className="bg-odd-panel/20 p-1">
                <h2 className="font-serif text-xl text-odd-text mb-4 border-b border-odd-border pb-2 flex items-center gap-2">
                    <span className="text-odd-accent text-2xl">I.</span> 
                    The Subject
                </h2>
                <CharacterSheet 
                    character={character} 
                    onRoll={handleRollAndGenerate} 
                    isLoading={status === 'enhancing' || status === 'generating'} 
                />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-sm text-sm font-mono">
                [ERROR] {error}
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="md:col-span-7">
            <h2 className="font-serif text-xl text-odd-text mb-4 border-b border-odd-border pb-2 flex items-center gap-2">
                <span className="text-odd-accent text-2xl">II.</span> 
                The Likenesses
            </h2>
            <ImageDisplay 
              images={generatedImages} 
              isLoading={status === 'enhancing' || status === 'generating'} 
              statusText={statusMessage}
            />
          </div>

        </div>
      </main>
      
      <footer className="text-center text-odd-muted/30 text-xs py-8 font-serif fixed bottom-0 w-full bg-gradient-to-t from-odd-dark to-transparent pointer-events-none">
         Into the Odd Rules by Chris McDowall. Powered by Gemini & Imagen.
      </footer>
    </div>
  );
};

export default App;