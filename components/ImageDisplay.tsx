import React, { useState, useEffect } from 'react';
import { GeneratedImage } from '../types';
import { Button } from './Button';

interface ImageDisplayProps {
  images: GeneratedImage[];
  isLoading: boolean;
  statusText: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ images, isLoading, statusText }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (images.length > 0 && !selectedId) {
      setSelectedId(images[0].id);
    }
    // If we generated a new set, reset selection to the first one
    if (images.length > 0 && !images.find(img => img.id === selectedId)) {
       setSelectedId(images[0].id);
    }
  }, [images, selectedId]);

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `odd-portrait-${image.mood.replace(/\s+/g, '-').toLowerCase()}-${image.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedImage = images.find(img => img.id === selectedId) || images[0];

  if (isLoading) {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-odd-border bg-odd-dark/30 text-odd-muted p-8 animate-pulse">
        <div className="font-serif text-xl mb-2 tracking-widest uppercase">Consulting the Ether</div>
        <div className="text-sm font-mono text-odd-accent text-center max-w-xs">{statusText}</div>
        <div className="mt-4 flex gap-2">
            <div className="w-2 h-2 bg-odd-accent animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-odd-accent animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-odd-accent animate-bounce" style={{animationDelay: '300ms'}}></div>
            <div className="w-2 h-2 bg-odd-accent animate-bounce" style={{animationDelay: '450ms'}}></div>
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square flex items-center justify-center border-2 border-dashed border-odd-border bg-odd-dark/30 text-odd-muted p-8">
        <div className="text-center">
          <p className="font-serif text-lg mb-2">No Portraits Manifested</p>
          <p className="text-sm opacity-60">Fill out the form to generate 4 variations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Main Selection View */}
      {selectedImage && (
        <div className="flex flex-col gap-4">
             <div className="relative group w-full aspect-square border-4 border-double border-odd-border shadow-2xl bg-black overflow-hidden">
                <img 
                    src={selectedImage.url} 
                    alt={`Portrait - ${selectedImage.mood}`} 
                    className="w-full h-full object-cover sepia-[0.2] contrast-[1.1] brightness-[0.9]" 
                />
                {/* Overlay effects */}
                <div className="absolute inset-0 pointer-events-none mix-blend-multiply bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.6)_100%)]"></div>
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
            </div>

            <div className="bg-odd-panel p-4 border border-odd-border text-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-odd-accent font-bold uppercase tracking-widest text-xs">
                        {selectedImage.mood}
                    </span>
                    <span className="text-odd-muted text-xs font-mono">{selectedImage.id}</span>
                </div>
                <p className="text-odd-text font-serif italic mb-4 text-sm opacity-80 line-clamp-2">
                    "{selectedImage.prompt}"
                </p>
                <Button onClick={() => handleDownload(selectedImage)} variant="secondary" className="w-full">
                    Save {selectedImage.mood} Variant
                </Button>
            </div>
        </div>
      )}

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((img) => (
            <button 
                key={img.id}
                onClick={() => setSelectedId(img.id)}
                className={`relative aspect-square border-2 overflow-hidden transition-all ${
                    selectedId === img.id 
                    ? 'border-odd-accent opacity-100 scale-105 z-10 shadow-lg' 
                    : 'border-odd-border opacity-60 hover:opacity-100 hover:border-odd-muted'
                }`}
            >
                <img src={img.url} alt={img.mood} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-odd-text text-[10px] py-1 text-center uppercase font-bold truncate px-1">
                    {img.mood}
                </div>
            </button>
        ))}
      </div>

    </div>
  );
};