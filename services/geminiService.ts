
import { GoogleGenAI } from "@google/genai";
import { Character, ApiProvider } from '../types';

/**
 * Uses a deterministic template to create character prompts.
 * Replaces previous LLM-based enhancement to ensure speed and consistency.
 */
export const enhancePrompt = async (character: Character, targetMood: string): Promise<string> => {
  const { gender, occupation, capability, equipment, oddity, abilities, arcanum } = character;

  const highestStat = Object.entries(abilities).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  // Random variations based on highest stat to ensure variety
  const strOptions = [
      'Burly physique, strong jaw, thick neck, scarred knuckles',
      'Broad-shouldered, imposing presence, weathered skin, heavy brow',
      'Muscular build, resolute expression, veins prominent, sturdy',
      'Stocky, battered features, aura of toughness, physical fortitude'
  ];

  const dexOptions = [
      'Lean and lithe, restless eyes, wiry frame, long fingers',
      'Slender, graceful posture, nimble, alert and twitchy',
      'Athletic build, quick movements, sharp bird-like features',
      'Sinuous, poised, cat-like eyes, coiled energy'
  ];

  const wilOptions = [
      'Intense gaze, commanding presence, stern expression, disciplined',
      'Charismatic smirk, focused eyes, air of authority, confident',
      'Upright posture, piercing stare, unnervingly calm',
      'Magnetic personality visible in eyes, stoic, calculating'
  ];

  let physicalDesc = "";
  if (highestStat === 'STR') {
      physicalDesc = strOptions[Math.floor(Math.random() * strOptions.length)];
  } else if (highestStat === 'DEX') {
      physicalDesc = dexOptions[Math.floor(Math.random() * dexOptions.length)];
  } else {
      physicalDesc = wilOptions[Math.floor(Math.random() * wilOptions.length)];
  }

  // Map moods to specific art style instructions
  let styleDetails = "";
  switch (targetMood) {
    case 'Grim Engraving':
      styleDetails = "Medium: Copperplate Engraving or Woodcut. Style: High contrast black ink on textured paper. Cross-hatching, thick lines, stark shadows. No color. Rough and gritty.";
      break;
    case 'Desaturated Oil':
      styleDetails = "Medium: Oil Painting on Canvas. Style: 19th century realism, visible brushstrokes. Palette: Muted, desaturated earth tones (rust, slate, olive, ochre, beige). Low saturation but definitely containing color. Chiaroscuro lighting.";
      break;
    case 'Ethereal Watercolor':
      styleDetails = "Medium: Watercolor and Ink Wash. Style: Bleeding edges, wet-on-wet technique. Palette: Pale, ghostly greys, blues, and whites. Atmosphere: Misty, dreamlike, soft focus, translucent.";
      break;
    case 'Vintage Daguerreotype':
      styleDetails = "Medium: Early 1850s Photography (Daguerreotype). Style: Heavy film grain, silver nitrate tarnish, scratches, vignette. Palette: Monochromatic sepia or black and white. Hauntingly realistic, slight motion blur.";
      break;
    default:
      styleDetails = "Medium: Mixed Media. Style: Industrial grit, textured.";
  }

  // Construct a deterministic template prompt.
  return `(Style: ${targetMood}) ${styleDetails} Subject: Close-up portrait of a ${gender} ${occupation}. Appearance: ${physicalDesc}. ${oddity ? `Distinction: ${oddity}.` : ''} Equipment: ${equipment.slice(0,2).join(', ')}.`;
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
      prompt: prompt + ", masterpiece, best quality, detailed, 8k, artstation, into the odd style",
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
 * Fetches an image from the Art Institute of Chicago API.
 * Great for etchings, engravings, and public domain art.
 * Returns null if no valid image found.
 */
const fetchArtInstituteImage = async (query: string): Promise<string | null> => {
    try {
        // AIC API parameters
        // We specifically ask for public domain works
        const params = new URLSearchParams({
            q: query,
            'query[term][is_public_domain]': 'true',
            limit: '15', // Fetch a batch to allow random selection
            fields: 'id,title,image_id',
        });
        
        const response = await fetch(`https://api.artic.edu/api/v1/artworks/search?${params.toString()}`);
        const data = await response.json();
        
        const artworks = data?.data;
        if (!artworks || artworks.length === 0) return null;
        
        // Filter for artworks that actually have an image_id
        const validArtworks = artworks.filter((art: any) => art.image_id);
        
        if (validArtworks.length === 0) return null;

        // Pick a random one for variety
        const randomArt = validArtworks[Math.floor(Math.random() * validArtworks.length)];
        
        // Construct IIIF URL
        // https://www.artic.edu/iiif/2/{identifier}/full/843,/0/default.jpg
        return `https://www.artic.edu/iiif/2/${randomArt.image_id}/full/843,/0/default.jpg`;

    } catch (e) {
        console.error("Art Institute fetch error", e);
        return null;
    }
}

/**
 * Generates a Search URL. 
 * Tries to fetch a direct image from Art Institute of Chicago first.
 * Falls back to a Google Search Link Card if no image is found.
 */
const generateWithSearch = async (prompt: string): Promise<string> => {
  // Extract Mood from the prompt string we constructed in enhancePrompt
  // Format: "(Style: Grim Engraving) ..."
  const styleMatch = prompt.match(/^\(Style: ([^)]+)\)/);
  const mood = styleMatch ? styleMatch[1] : "Character";

  // Extract Subject components
  // Format: "... Subject: Close-up portrait of a Male Actor. ..."
  const subjectMatch = prompt.match(/Subject: Close-up portrait of a ([^.]+)\./);
  // capture group 1 is "Male Actor"
  const rawSubject = subjectMatch ? subjectMatch[1] : "Male Character";
  
  // 1. Construct Art Institute Query
  // AIC uses boolean search logic. We want specific mediums for specific moods.
  let aicQuery = "";
  
  // Clean subject: "Male Coal Miner" -> "Miner" often yields better art results than full phrasing
  // We try to strip "Male" or "Female" to broaden search to the profession/archetype
  const cleanSubject = rawSubject.replace(/Male |Female /gi, "").trim();
  
  // Add gender back in loosely if needed, but profession is usually stronger for visual search
  const gender = rawSubject.split(" ")[0]; 

  switch (mood) {
      case 'Grim Engraving': 
          // Etchings, Lithographs, Engravings
          aicQuery = `${cleanSubject} etching | engraving | lithograph`; 
          break;
      case 'Desaturated Oil': 
          // Oil paintings, portraits
          aicQuery = `${cleanSubject} oil painting | portrait`; 
          break;
      case 'Ethereal Watercolor': 
          // Drawings, sketches, washes
          aicQuery = `${cleanSubject} watercolor | wash drawing | sketch`; 
          break;
      case 'Vintage Daguerreotype': 
          // Photographs (AIC has some, but might need fallback to just portrait/drawing if scarce)
          aicQuery = `${cleanSubject} photograph | daguerreotype | tintype`; 
          break;
      default: 
          aicQuery = `${cleanSubject} portrait`;
  }

  // Attempt fetch
  const artImageUrl = await fetchArtInstituteImage(aicQuery);
  if (artImageUrl) return artImageUrl;

  // 2. Fallback to Google Search Link Card
  // Construct the search query
  const googleQuery = `${mood} ${rawSubject} Into the Odd RPG art`;
  const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(googleQuery)}`;

  // Generate a thematic SVG placeholder
  const svg = `
  <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#44403c" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="#1c1917"/>
    <rect width="100%" height="100%" fill="url(#grid)" opacity="0.2"/>
    <rect x="20" y="20" width="360" height="360" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="4 2"/>
    
    <circle cx="200" cy="160" r="40" fill="none" stroke="#d97706" stroke-width="2"/>
    <line x1="228" y1="188" x2="250" y2="210" stroke="#d97706" stroke-width="4"/>
    
    <text x="50%" y="65%" font-family="Courier, monospace" font-size="20" fill="#e7e5e4" text-anchor="middle" font-weight="bold" letter-spacing="1">NO ARCHIVE FOUND</text>
    <text x="50%" y="75%" font-family="Courier, monospace" font-size="14" fill="#a8a29e" text-anchor="middle">${mood.toUpperCase()}</text>
    <text x="50%" y="85%" font-family="Courier, monospace" font-size="10" fill="#44403c" text-anchor="middle">CLICK TO SEARCH GOOGLE</text>
  </svg>`;

  const base64Svg = btoa(svg);
  return `data:image/svg+xml;base64,${base64Svg}#external_link=${encodeURIComponent(searchUrl)}`;
};

/**
 * Generates image using Pollinations.ai.
 * Supports different models (Flux, Turbo).
 */
const generateWithPollinations = async (prompt: string, model: 'flux' | 'turbo'): Promise<string> => {
  const ATTEMPTS = 3;
  const MAX_PROMPT_LENGTH = 800; // URL length safety

  // Truncate prompt if too long to prevent 400/414 errors
  const safeBasePrompt = prompt.length > MAX_PROMPT_LENGTH 
    ? prompt.substring(0, MAX_PROMPT_LENGTH) 
    : prompt;

  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      // Encode the prompt safely for URL
      const safePrompt = encodeURIComponent(safeBasePrompt + ", masterpiece, best quality, detailed, 8k, artstation");
      
      // Generate a random seed to ensure unique results for the same prompt
      const seed = Math.floor(Math.random() * 1000000);
      
      // Construct Pollinations URL
      const url = `https://pollinations.ai/p/${safePrompt}?width=768&height=768&seed=${seed}&model=${model}&nologo=true`;

      // We use the Image object to preload and verify the image exists.
      // This bypasses CORS restrictions that often block 'fetch' requests for images from 3rd parties.
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        let timer: ReturnType<typeof setTimeout>;

        const cleanup = () => {
           if (timer) clearTimeout(timer);
           img.onload = null;
           img.onerror = null;
        };
        
        img.onload = () => {
          cleanup();
          resolve();
        };
        
        img.onerror = () => {
          cleanup();
          // If it fails immediately, it might be a momentary glitch or strict network blocking.
          reject(new Error(`Pollinations (${model}) image failed to load via DOM`));
        };
        
        // Set a 60s timeout.
        timer = setTimeout(() => {
           console.warn("Image generation taking long (>60s), proceeding with render assuming lag.");
           cleanup();
           resolve(); 
        }, 60000);

        // Trigger load
        img.src = url;
      });

      // If promise resolves, we are good to go
      return url;

    } catch (error) {
      console.warn(`Attempt ${i + 1} to generate image failed:`, error);
      
      // If this was the last attempt, throw exception
      if (i === ATTEMPTS - 1) {
         console.error("Final attempt failed.", error);
         throw new Error("The ether is thick. Visualisation failed.");
      }
      
      // Wait a bit before retrying
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  throw new Error("The ether is thick. Visualisation failed.");
};

/**
 * Main generation entry point
 */
export const generateCharacterPortrait = async (prompt: string, provider: ApiProvider): Promise<string> => {
  if (provider === 'gemini') {
    return generateWithGemini(prompt);
  } else if (provider === 'search') {
    return generateWithSearch(prompt);
  } else if (provider === 'turbo') {
    return generateWithPollinations(prompt, 'turbo');
  } else {
    return generateWithPollinations(prompt, 'flux');
  }
};
