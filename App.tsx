import React, { useState } from 'react';
import { CharacterSheet } from './components/CharacterSheet';
import { ImageDisplay } from './components/ImageDisplay';
import { ModelSelector } from './components/ModelSelector';
import { AudioController } from './components/AudioController';
import { enhancePrompt, generateCharacterPortrait } from './services/geminiService';
import { generateCharacter } from './services/characterGenerator';
import { Character, GeneratedImage, GenerationStatus, Gender, ApiProvider } from './types';

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
  // Defaulting to Gemini as requested
  const [apiProvider, setApiProvider] = useState<ApiProvider>('gemini');

  // Helper for display text
  const getProviderName = (p: ApiProvider) => {
    if (p === 'gemini') return 'Gemini';
    if (p === 'flux') return 'Flux';
    return 'Turbo';
  };

  // Reusable function to generate images for a specific character
  const generatePortraitsForCharacter = async (char: Character) => {
    try {
        setError(null);
        setGeneratedImages([]); 
        setStatus('enhancing');
        setStatusMessage(`Initializing visualisation protocols for ${char.name}...`);
  
        let successfulCount = 0;

        // Process moods sequentially to avoid Rate Limits (429)
        for (let i = 0; i < TARGET_MOODS.length; i++) {
            const mood = TARGET_MOODS[i];
            
            setStatus('generating');
            setStatusMessage(`Processing Plate ${i+1}/${TARGET_MOODS.length}: ${mood} via ${getProviderName(apiProvider)}...`);

            try {
              // Add a delay between requests to prevent hitting rate limits (Resource Exhausted)
              // Skip delay for the first one for immediate feedback
              // Gemini needs stricter delays, Flux is usually okay but good to be safe.
              // We skip delay entirely for Turbo to maximize speed.
              if (i > 0 && apiProvider !== 'turbo') {
                  const delay = apiProvider === 'gemini' ? 2000 : 1000;
                  await new Promise(resolve => setTimeout(resolve, delay));
              }

              const enhancedPrompt = await enhancePrompt(char, mood, apiProvider === 'turbo');
              
              // Update message for image generation phase
              setStatusMessage(`Developing Plate ${i+1}/${TARGET_MOODS.length}: ${mood}...`);
              
              const imageUrl = await generateCharacterPortrait(enhancedPrompt, apiProvider);
              
              const newImage: GeneratedImage = {
                id: generateId(),
                url: imageUrl,
                prompt: enhancedPrompt,
                mood: mood,
                characterName: char.name,
                timestamp: Date.now(),
              };

              // Update state incrementally so user sees images as they arrive
              setGeneratedImages(prev => [...prev, newImage]);
              successfulCount++;

            } catch (e: any) {
              console.error(`Failed to generate mood ${mood}:`, e);
              
              // For rate limits, we log and continue to try the next one after a longer pause
              if (e.toString().includes("429") || e.toString().includes("RESOURCE_EXHAUSTED")) {
                  console.warn("Rate limit hit, pausing before next attempt.");
                  setStatusMessage("Ether congested. Cooling down logic engines...");
                  await new Promise(resolve => setTimeout(resolve, 4000));
              } else if (e.toString().includes("Safety")) {
                  // If Gemini safety blocks it, maybe try the next mood or just fail this one silently
                   setStatusMessage("Visual too disturbing for the ether. Skipping...");
              }
            }
        }
        
        if (successfulCount === 0) {
          throw new Error(`All portrait attempts failed via ${getProviderName(apiProvider)}. Try switching providers.`);
        }
  
        setStatus('complete');
    } catch (err: any) {
        console.error(err);
        setStatus('error');
        setError(err.message || 'The ether is clouded. The portraiture machine malfunctioned.');
    }
  };

  const handleRollAndGenerate = async (gender: Gender) => {
      // 1. Generate Character Logic
      const newChar = generateCharacter(gender);
      setCharacter(newChar);
      
      // 2. Generate Images
      await generatePortraitsForCharacter(newChar);
  };

  const handleRegeneratePortraits = async () => {
      if (character) {
          await generatePortraitsForCharacter(character);
      }
  };

  return (
    <div className="min-h-screen font-sans text-odd-text selection:bg-odd-accent selection:text-white pb-32">
        <div className="fixed inset-0 pointer-events-none z-50 scanline opacity-20"></div>

      <header className="border-b-4 border-double border-odd-border bg-odd-dark/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left flex-shrink-0">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tighter text-odd-accent uppercase shadow-black drop-shadow-md">
              The Bastion Registry
            </h1>
            <p className="text-xs md:text-sm text-odd-muted tracking-widest uppercase mt-1">
              Registry of Vagabonds & Visage
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
             <AudioController />
             <ModelSelector 
                current={apiProvider} 
                onChange={setApiProvider} 
                disabled={status === 'enhancing' || status === 'generating'} 
              />
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
                    isLoading={status === 'enhancing' || (status === 'generating' && generatedImages.length === 0)} 
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
              onRegenerate={handleRegeneratePortraits}
              hasCharacter={!!character}
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