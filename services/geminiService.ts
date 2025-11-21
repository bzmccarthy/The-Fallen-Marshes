import { GoogleGenAI } from "@google/genai";
import { Character, ApiProvider } from '../types';

const ODD_FLAVOR_TERMS = [
  "Victorian industrial era", 
  "Gritty early Victorian", 
  "Weird Victorian cosmic horror", 
  "Soot-stained Victorian factory backdrop", 
  "Victorian Brass and rust", 
  "Arcane Victorian machinery", 
  "Gaslight Victorian atmosphere", 
  "Strange Victorian evolution", 
  "Pale Victorian smog", 
  "Decaying Victorian opulence", 
  "Galvanic Victorian experiments",
  "Victorian city slums",
  "Underground Victorian tunnels",
  "Star-spawned Victorian influence"
];

/**
 * Uses a deterministic template to create character prompts.
 * Replaces previous LLM-based enhancement to ensure speed and consistency.
 */
export const enhancePrompt = async (character: Character, targetMood: string): Promise<string> => {
  const { gender, occupation, capability, equipment, oddity, abilities, arcanum } = character;

  const highestStat = Object.entries(abilities).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  // Random variations based on highest stat to ensure variety
  const strOptions = [
      'Burly physique, strong jaw',
      'Broad-shouldered, weathered skin',
      'Muscular build, sturdy',
      'Stocky, battered features'
  ];

  const dexOptions = [
      'Lean, wiry frame',
      'Slender, graceful posture',
      'Athletic build, sharp features',
      'Sinuous, cat-like eyes'
  ];

  const wilOptions = [
      'Intense gaze, stern expression',
      'Charismatic smirk, focused eyes',
      'Upright posture, piercing stare',
      'Magnetic personality, stoic'
  ];

  let physicalDesc = "";
  if (highestStat === 'STR') {
      physicalDesc = strOptions[Math.floor(Math.random() * strOptions.length)];
  } else if (highestStat === 'DEX') {
      physicalDesc = dexOptions[Math.floor(Math.random() * dexOptions.length)];
  } else {
      physicalDesc = wilOptions[Math.floor(Math.random() * wilOptions.length)];
  }

  // Map moods to specific art style instructions for complex models
  let styleDetails = "";
  switch (targetMood) {
    case 'Grim Engraving':
      styleDetails = "Medium: Copperplate Engraving. Style: High contrast black ink, cross-hatching, stark shadows. Rough and gritty.";
      break;
    case 'Desaturated Oil':
      styleDetails = "Medium: Desaturated Oil Painting. Style: Realism, visible brushstrokes. Palette: Muted earth tones (rust, slate, olive). Chiaroscuro.";
      break;
    case 'Ethereal Watercolor':
      styleDetails = "Medium: Watercolor. Style: Bleeding edges, wet-on-wet. Palette: Pale greys, blues. Atmosphere: Misty, dreamlike.";
      break;
    case 'Vintage Daguerreotype':
      styleDetails = "Medium: 1850s Daguerreotype. Style: Heavy film grain, silver nitrate tarnish, vignette. Monochromatic sepia. Haunting.";
      break;
    default:
      styleDetails = "Medium: Mixed Media. Style: Industrial grit.";
  }

  // Clean equipment strings to remove damage dice (e.g. "Sword (d6)" -> "Sword")
  // UPDATED: Regex now aggressively targets (d6), (d8 B), and standalone dice notations to prevent them appearing in prompts.
  const cleanEquipment = equipment.slice(0, 2).map(item => 
    item.replace(/\s*\([^)]*\)/g, '') // Remove anything in parentheses
        .replace(/\bd\d+\b/g, '')      // Remove standalone dice notation (d6, d8, etc)
        .trim()
  );

  // Select 2 random setting descriptors to add flavor
  const shuffledFlavor = [...ODD_FLAVOR_TERMS].sort(() => 0.5 - Math.random());
  const flavor = shuffledFlavor.slice(0, 2).join(', ');

  // Construct a detailed deterministic template prompt for high-fidelity models.
  // UPDATED: Removed "(Style: Name)" prefix to prevent the model from rendering the text in the image.
  // UPDATED: Stronger framing constraints (Tightly framed head and shoulders bust portrait)
  // UPDATED: Added flavor text for setting/atmosphere
  return `${styleDetails} Setting: ${flavor}. Subject: Tightly framed head and shoulders bust portrait of a ${gender} ${occupation}. Center face. Appearance: ${physicalDesc}. ${oddity ? `Distinction: ${oddity}.` : ''} Wearing: ${cleanEquipment.join(', ')}.`;
};

/**
 * Generates image using Google Gemini (Imagen 3).
 * Fast, high quality, but subject to quotas and safety filters.
 */
const generateWithGemini = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      // UPDATED: Added 'headshot, face focus' to suffix
      prompt: prompt + ", masterpiece, best quality, detailed, 8k, artstation, headshot, face focus",
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      }
    });

    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64) throw new Error("Gemini returned no image data.");
    
    return `data:image/jpeg;base64,${base64}`;
  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    
    let msg = "The ether is thick. Gemini visualisation failed.";
    if (error.message?.includes("safety")) msg = "The vision was too disturbing (Safety Filter Triggered).";
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) msg = "The mind's eye is exhausted (Quota Exceeded).";
    if (error.message?.includes("404") || error.message?.includes("NOT_FOUND")) msg = "The specific vision engine is unavailable (Model Not Found).";

    throw new Error(msg);
  }
};

/**
 * Generates image using Gemini Flash.
 * Faster, higher quotas, uses gemini-2.5-flash-image.
 */
const generateWithFlash = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Note: Flash models use generateContent, not generateImages
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        // UPDATED: Added 'headshot, face focus' to suffix
        parts: [{ text: prompt + ", masterpiece, best quality, detailed, 8k, artstation, headshot, face focus" }]
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1"
        }
      }
    });

    // Iterate through parts to find the image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Gemini Flash returned no image data.");
  } catch (error: any) {
    console.error("Gemini Flash Gen Error:", error);
    
    let msg = "The ether is thick. Flash visualisation failed.";
    if (error.message?.includes("safety")) msg = "The vision was too disturbing (Safety Filter Triggered).";
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) msg = "The mind's eye is exhausted (Quota Exceeded).";
    
    throw new Error(msg);
  }
};

/**
 * Generates image using Pollinations.ai.
 * Supports different models (Flux, Turbo).
 * Returns URL immediately to allow parallel loading in browser.
 */
const generateWithPollinations = async (prompt: string, model: 'flux' | 'turbo'): Promise<string> => {
  const MAX_PROMPT_LENGTH = 800; // URL length safety
  // UPDATED: Added 'headshot, face focus' to suffix
  const SUFFIX = ", masterpiece, best quality, detailed, 8k, artstation, headshot, face focus";

  // Truncate prompt if too long to prevent 400/414 errors, reserving space for suffix
  const availableLength = MAX_PROMPT_LENGTH - SUFFIX.length;
  const safeBasePrompt = prompt.length > availableLength 
    ? prompt.substring(0, availableLength) 
    : prompt;

  // Encode the prompt safely for URL
  // Adding back the quality suffix to match Gemini/Flash behavior
  const safePrompt = encodeURIComponent(safeBasePrompt + SUFFIX);
  
  // Generate a random seed to ensure unique results for the same prompt
  const seed = Math.floor(Math.random() * 1000000);
  
  // Construct Pollinations URL
  // Optimizations: 512x512, n=1 (single image)
  const url = `https://pollinations.ai/p/${safePrompt}?width=512&height=512&seed=${seed}&model=${model}&nologo=true&n=1`;

  return url;
};

/**
 * Main generation entry point
 */
export const generateCharacterPortrait = async (prompt: string, provider: ApiProvider): Promise<string> => {
  if (provider === 'gemini') {
    return generateWithGemini(prompt);
  } else if (provider === 'flash') {
    return generateWithFlash(prompt);
  } else if (provider === 'turbo') {
    return generateWithPollinations(prompt, 'turbo');
  } else {
    return generateWithPollinations(prompt, 'flux');
  }
};