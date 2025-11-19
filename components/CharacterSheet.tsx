import React, { useState } from 'react';
import { Character, Gender } from '../types';
import { Button } from './Button';

interface CharacterSheetProps {
  character: Character | null;
  onRoll: (gender: Gender) => void;
  isLoading: boolean;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, onRoll, isLoading }) => {
  const [selectedGender, setSelectedGender] = useState<Gender>('Random');

  const handleRoll = () => {
    onRoll(selectedGender);
  };

  const GenderToggle = () => (
    <div className="flex justify-center gap-2 mb-4">
        {(['Male', 'Female', 'Random'] as Gender[]).map(g => (
            <button 
                key={g}
                onClick={() => setSelectedGender(g)}
                disabled={isLoading}
                className={`text-xs font-bold px-3 py-1 uppercase border ${
                    selectedGender === g 
                    ? 'bg-odd-accent text-odd-bg border-odd-accent' 
                    : 'bg-transparent text-odd-muted border-odd-border hover:border-odd-muted'
                }`}
            >
                {g}
            </button>
        ))}
    </div>
  );

  if (!character) {
    return (
      <div className="bg-odd-panel/20 p-8 border border-odd-border border-dashed text-center flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="font-serif text-2xl text-odd-muted mb-4 uppercase tracking-widest">Tabula Rasa</h3>
        <p className="text-odd-muted/60 mb-4 max-w-xs">The pages are blank. Summon a soul from the Bastion logic engines.</p>
        
        <GenderToggle />

        <Button onClick={handleRoll} isLoading={isLoading} className="w-full max-w-xs">
           Roll New Character
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-odd-text text-odd-dark font-serif p-1 shadow-xl relative rotate-1 max-w-md mx-auto md:mx-0">
        {/* Paper Texture Effect */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50 pointer-events-none"></div>
        
        <div className="border-4 border-double border-odd-dark p-6 h-full relative bg-[#d6d3d1]">
            
            {/* Header */}
            <div className="flex justify-between items-baseline border-b-2 border-odd-dark pb-2 mb-6">
                <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tighter leading-none">{character.name}</h2>
                    <div className="flex gap-2 items-baseline mt-1">
                        <span className="text-xs font-bold text-odd-dark/50">{character.gender}</span>
                        <span className="text-sm uppercase font-bold text-odd-dark/70">{character.occupation}</span>
                    </div>
                </div>
                <div className="text-right pl-2">
                    <div className="text-xs uppercase font-bold text-odd-dark/60">Capability</div>
                    <div className="text-sm italic leading-tight">{character.capability}</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6 text-center">
                <div className="border-2 border-odd-dark p-2">
                    <div className="text-xs font-bold uppercase mb-1">STR</div>
                    <div className="text-2xl font-bold">{character.abilities.STR}</div>
                </div>
                <div className="border-2 border-odd-dark p-2">
                    <div className="text-xs font-bold uppercase mb-1">DEX</div>
                    <div className="text-2xl font-bold">{character.abilities.DEX}</div>
                </div>
                <div className="border-2 border-odd-dark p-2">
                    <div className="text-xs font-bold uppercase mb-1">WIL</div>
                    <div className="text-2xl font-bold">{character.abilities.WIL}</div>
                </div>
                <div className="border-2 border-odd-dark p-2 bg-black text-white">
                    <div className="text-xs font-bold uppercase mb-1 text-white/80">HP</div>
                    <div className="text-2xl font-bold">{character.hp}</div>
                </div>
            </div>

            {/* Inventory */}
            <div className="mb-6">
                <h3 className="text-xs font-bold uppercase border-b border-odd-dark mb-2">Equipment & Possessions</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                    {character.equipment.map((item, idx) => (
                        <li key={idx} className={item.includes("Arcanum") || item === character.arcanum?.name ? "font-bold text-amber-900" : ""}>
                            {item}
                        </li>
                    ))}
                    <li>{character.wealth} Shillings</li>
                </ul>
            </div>

            {/* Arcanum Detail */}
            {character.arcanum && (
                 <div className="mb-6 bg-odd-dark/5 p-3 border border-odd-dark/20 text-xs">
                    <strong className="block uppercase mb-1 text-amber-900">Arcanum: {character.arcanum.name}</strong>
                    <p className="italic">{character.arcanum.description}</p>
                </div>
            )}

            <div className="mt-8 pt-4 border-t-2 border-odd-dark border-dotted text-center">
                <div className="mb-3 opacity-70">
                    <GenderToggle />
                </div>
                 <Button onClick={handleRoll} variant="secondary" isLoading={isLoading} className="w-full text-xs !border-odd-dark !text-odd-dark hover:!bg-odd-dark hover:!text-odd-text">
                    Reroll (Dispose of Subject)
                </Button>
            </div>

        </div>
    </div>
  );
};