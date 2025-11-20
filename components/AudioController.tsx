import React, { useState, useEffect, useRef } from 'react';

export const AudioController: React.FC = () => {
  // Default to OFF, Default volume 0.8 (Louder)
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  
  const chordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const melodyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const activeNodesRef = useRef<AudioScheduledSourceNode[]>([]);

  // Handle volume changes in real-time
  useEffect(() => {
    if (masterGainRef.current) {
        const now = audioContextRef.current?.currentTime || 0;
        masterGainRef.current.gain.setTargetAtTime(volume, now, 0.1);
    }
  }, [volume]);

  // Manage Audio State
  useEffect(() => {
    if (isPlaying) {
      initAudio();
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [isPlaying]);

  const createReverbImpulse = (ctx: AudioContext) => {
    // Long, vast industrial hall reverb
    const duration = 4.0;
    const decay = 4.0;
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const n = i / length;
        const vol = Math.pow(1 - n, decay);
        // Simple white noise burst for impulse
        left[i] = (Math.random() * 2 - 1) * vol;
        right[i] = (Math.random() * 2 - 1) * vol;
    }
    return impulse;
  };

  const playOscillator = (
    ctx: AudioContext, 
    dest: AudioNode, 
    freq: number, 
    type: OscillatorType, 
    startTime: number, 
    duration: number, 
    vol: number,
    attack: number = 2,
    release: number = 3
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    // ADSR-ish Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + attack);
    gain.gain.setValueAtTime(vol, startTime + duration - release);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(dest);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
    
    activeNodesRef.current.push(osc);
    
    // Cleanup helper
    setTimeout(() => {
        activeNodesRef.current = activeNodesRef.current.filter(n => n !== osc);
    }, (duration + 1) * 1000);
  };

  const initAudio = () => {
    if (audioContextRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    // Handle Browser Autoplay Policy
    // If context is suspended (likely), wait for first interaction to resume
    if (ctx.state === 'suspended') {
        const resume = () => {
            ctx.resume();
            // Clean up listeners
            ['click', 'keydown', 'touchstart'].forEach(e => document.removeEventListener(e, resume));
        };
        ['click', 'keydown', 'touchstart'].forEach(e => document.addEventListener(e, resume));
    }

    // Master Chain
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Reverb Chain
    const reverb = ctx.createConvolver();
    reverb.buffer = createReverbImpulse(ctx);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.5; // Wet mix
    reverb.connect(reverbGain);
    reverbGain.connect(masterGain);
    reverbNodeRef.current = reverb;

    // 1. Atmospheric Sub-Bass (The "Drone" - now smoother)
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 100; // Deep rumble, not grating hiss
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08; 
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    activeNodesRef.current.push(noise);

    // 2. Musical Sequence
    const chords = [
        [130.81, 155.56, 196.00], // Cm
        [103.83, 130.81, 155.56], // Ab
        [87.31, 103.83, 130.81],  // Fm
        [98.00, 123.47, 146.83]   // G
    ];
    
    // C Minor Pentatonic-ish for melody
    const melodyNotes = [261.63, 311.13, 392.00, 523.25]; 

    let chordIndex = 0;

    const playChord = () => {
        if (!audioContextRef.current) return;
        const now = ctx.currentTime;
        const duration = 12; 
        const notes = chords[chordIndex];
        
        notes.forEach((freq) => {
            // Triangle for body, Sine for depth. Higher gain (0.2) for visibility.
            playOscillator(ctx, reverb, freq, 'triangle', now, duration, 0.2, 2, 4);
            playOscillator(ctx, reverb, freq * 1.01, 'sine', now, duration, 0.2, 2, 4);
        });

        chordIndex = (chordIndex + 1) % chords.length;
    };

    const playRandomMelody = () => {
        if (!audioContextRef.current) return;
        if (Math.random() > 0.5) return; // Occasional
        
        const now = ctx.currentTime;
        const freq = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
        const duration = 4;
        
        // Clear, bell-like tones
        playOscillator(ctx, reverb, freq, 'sine', now, duration, 0.15, 0.1, 3);
        playOscillator(ctx, reverb, freq * 2, 'triangle', now, duration, 0.05, 0.1, 3);
    };

    // Start loop
    playChord();
    chordTimerRef.current = setInterval(playChord, 10000);
    melodyTimerRef.current = setInterval(playRandomMelody, 3000);
  };

  const stopAudio = () => {
    activeNodesRef.current.forEach(n => {
        try { n.stop(); } catch (e) {}
    });
    activeNodesRef.current = [];

    if (chordTimerRef.current) clearInterval(chordTimerRef.current);
    if (melodyTimerRef.current) clearInterval(melodyTimerRef.current);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  return (
    <div className="flex items-center gap-2 bg-odd-panel/50 rounded border border-odd-border p-1 self-start md:self-auto">
        <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className={`flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-all min-w-[100px] justify-center
            ${isPlaying 
            ? 'bg-odd-accent/10 text-odd-accent shadow-[0_0_10px_rgba(217,119,6,0.2)] border border-odd-accent' 
            : 'text-odd-muted hover:text-odd-text hover:bg-white/5 border border-transparent'
            }`}
        >
        <span>{isPlaying ? 'Audio On' : 'Audio Off'}</span>
        
        {/* Mini Visualizer */}
        <div className={`flex gap-[2px] items-end h-3 transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-[2px] bg-current h-full ${isPlaying ? 'animate-[pulse_1.8s_ease-in-out_infinite]' : ''}`}></div>
            <div className={`w-[2px] bg-current h-2/3 ${isPlaying ? 'animate-[pulse_1.1s_ease-in-out_infinite]' : ''}`}></div>
            <div className={`w-[2px] bg-current h-3/4 ${isPlaying ? 'animate-[pulse_2.5s_ease-in-out_infinite]' : ''}`}></div>
        </div>
        </button>
        
        {/* Volume Slider - Only visible when playing */}
        {isPlaying && (
            <div className="flex items-center pr-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-odd-dark rounded-lg appearance-none cursor-pointer accent-odd-accent"
                    title="Volume"
                />
            </div>
        )}
    </div>
  );
};