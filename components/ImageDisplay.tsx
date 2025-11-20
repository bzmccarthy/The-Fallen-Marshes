import React, { useState, useEffect } from 'react';
import { GeneratedImage } from '../types';
import { Button } from './Button';

interface ImageDisplayProps {
  images: GeneratedImage[];
  isLoading: boolean;
  statusText: string;
  onRegenerate: () => void;
  hasCharacter: boolean;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
    images, 
    isLoading, 
    statusText,
    onRegenerate,
    hasCharacter
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (images.length > 0 && !selectedId) {
      setSelectedId(images[0].id);
    }
    // If we generated a new set, reset selection to the first one unless current selection still exists
    if (images.length > 0 && selectedId && !images.find(img => img.id === selectedId)) {
       setSelectedId(images[0].id);
    }
    // Fallback for first load of a new set
    if (images.length > 0 && !selectedId) {
        setSelectedId(images[0].id);
    }
  }, [images, selectedId]);

  const handleImageError = (id: string) => {
    setFailedImages(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
    });
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
        // Attempt to fetch blob to force a clean download
        const response = await fetch(image.url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `odd-portrait-${image.mood.replace(/\s+/g, '-').toLowerCase()}-${image.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        console.warn("Direct download failed (likely CORS), opening in new tab fallback.", e);
        // Fallback: just open the URL. Browser might not "download" automatically, but user gets the image.
        window.open(image.url, '_blank');
    }
  };

  // Show full loader only if we are loading AND have no images to show yet
  if (isLoading && (!images || images.length === 0)) {
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

  // Empty state (no images, not loading)
  if (!isLoading && (!images || images.length === 0)) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-full aspect-square flex items-center justify-center border-2 border-dashed border-odd-border bg-odd-dark/30 text-odd-muted p-8">
            <div className="text-center">
            <p className="font-serif text-lg mb-2">No Portraits Manifested</p>
            <p className="text-sm opacity-60">Fill out the form to generate 4 variations.</p>
            </div>
        </div>
        
        {/* Allow re-generation even if empty, provided a character exists (e.g. if previous gen failed) */}
        {hasCharacter && (
             <Button onClick={onRegenerate} variant="secondary" className="w-full border-dashed">
                Attempt Portraiture Again
            </Button>
        )}
      </div>
    );
  }

  // Main Display (Images exist, might be loading more)
  const selectedImage = images.find(img => img.id === selectedId) || images[0];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Incremental Loading Indicator */}
      {isLoading && (
          <div className="bg-odd-panel/50 border border-odd-accent/30 p-2 text-xs text-center text-odd-accent animate-pulse font-mono">
              {statusText}
          </div>
      )}

      {/* Main Selection View */}
      {selectedImage && (
        <div className="flex flex-col gap-4">
             <div className="relative group w-full aspect-square border-4 border-double border-odd-border shadow-2xl bg-black overflow-hidden flex items-center justify-center">
                {!failedImages.has(selectedImage.id) ? (
                    <img 
                        src={selectedImage.url} 
                        alt={`Portrait - ${selectedImage.mood}`} 
                        onError={() => handleImageError(selectedImage.id)}
                        className="w-full h-full object-cover sepia-[0.2] contrast-[1.1] brightness-[0.9]" 
                    />
                ) : (
                    <div className="text-center p-4 text-odd-muted opacity-50">
                        <div className="font-serif text-xl mb-2">Visualisation Lost</div>
                        <div className="text-xs font-mono">The signal dissipated</div>
                    </div>
                )}
                
                {/* Overlay effects - only if not failed */}
                {!failedImages.has(selectedImage.id) && (
                    <>
                        <div className="absolute inset-0 pointer-events-none mix-blend-multiply bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.6)_100%)]"></div>
                        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
                    </>
                )}
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
                <div className="flex gap-2">
                    <Button 
                        onClick={() => handleDownload(selectedImage)} 
                        variant="primary" 
                        disabled={failedImages.has(selectedImage.id)}
                        className="flex-1 text-xs py-2"
                    >
                        Keep {selectedImage.mood}
                    </Button>
                </div>
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
                {!failedImages.has(img.id) ? (
                     <img 
                        src={img.url} 
                        alt={img.mood} 
                        onError={() => handleImageError(img.id)}
                        className="w-full h-full object-cover" 
                     />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-odd-panel text-odd-muted/20 text-xs">
                        X
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-odd-text text-[10px] py-1 text-center uppercase font-bold truncate px-1">
                    {img.mood}
                </div>
            </button>
        ))}
        
        {/* Placeholders for pending images */}
        {isLoading && Array.from({ length: Math.max(0, 4 - images.length) }).map((_, idx) => (
             <div key={`placeholder-${idx}`} className="aspect-square border-2 border-dashed border-odd-border/30 bg-odd-panel/20 animate-pulse flex items-center justify-center">
                 <span className="text-odd-muted/20 text-xs">...</span>
             </div>
        ))}
      </div>

      {/* Re-roll only images */}
      {hasCharacter && !isLoading && (
        <div className="pt-4 border-t border-odd-border border-dashed">
             <Button onClick={onRegenerate} variant="secondary" className="w-full text-xs">
                Capture New Plates (Keep Stats)
            </Button>
        </div>
      )}

    </div>
  );
};