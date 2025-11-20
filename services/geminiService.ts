import { GoogleGenAI } from "@google/genai";
import { Character, ApiProvider } from '../types';

/**
 * Uses a text model to rewrite character stats into a specific artistic prompt.
 * Now enforces distinct artistic mediums to ensure visual variety.
 */
export const enhancePrompt = async (character: Character, targetMood: string): Promise<string> => {
  // Initialize client per request to ensure we use the most current API Key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const { name, gender, occupation, capability, equipment, oddity, abilities, arcanum } = character;

  const highestStat = Object.entries(abilities).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const physicalDesc = highestStat === 'STR' ? 'Burly, strong features, thick neck' : 
                       highestStat === 'DEX' ? 'Sharp features, intense eyes, wiry' : 
                       'Gaunt, pale, focused expression, cerebral';

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

  const systemInstruction = `You are an expert art director for the TTRPG "Into the Odd". 
  Your task is to take character sheet data and convert it into a detailed image generation prompt.
  
  The "Into the Odd" aesthetic is:
  - Industrial Revolution meets Weird Science.
  - Eras: 18th/19th Century.
  - Atmosphere: Eerie, foggy, industrial, eccentric.
  
  CRITICAL FRAMING: You must generate prompts for CLOSE-UP PORTRAITS (Bust/Headshot). 
  Focus strictly on the face, head, and shoulders. 
  Do NOT describe full body poses, legs, or environments. 
  This is for a Virtual Tabletop (VTT) token.

  You must output a prompt that strictly adheres to the provided TARGET VISUAL STYLE.
  Output ONLY the raw prompt string. No markdown.`;

  const userPrompt = `Create a close-up portrait prompt for this character:
  - Name: ${name}
  - Gender: ${gender}
  - Occupation: ${occupation}
  - Capability/Trait: ${capability}
  - Physical Description: ${physicalDesc}
  - Distinctive Feature: ${oddity || 'None'}
  - Key Equipment (Visible only if near face/shoulders): ${equipment.slice(0, 2).join(', ')}
  - Arcanum (Magic Item): ${arcanum ? arcanum.name + ' (' + arcanum.description + ')' : 'None'}
  
  TARGET VISUAL STYLE:
  ${styleDetails}
  
  Framing: Tight close-up on the face and shoulders. High detail on the expression and texture.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    return response.text || `A gritty ${targetMood} close-up portrait of a ${gender} ${occupation}, ${physicalDesc}, style of Into the Odd.`;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw error;
  }
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
 * Generates image using Pollinations.ai (Flux model).
 * Slower, but unlimited and less censored.
 */
const generateWithPollinations = async (prompt: string): Promise<string> => {
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
      const url = `https://pollinations.ai/p/${safePrompt}?width=768&height=768&seed=${seed}&model=flux&nologo=true`;

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
          reject(new Error("Pollinations image failed to load via DOM"));
        };
        
        // Set a 60s timeout.
        // If it takes this long, we assume it's just slow/busy but valid.
        // We RESOLVE with the URL so the App doesn't crash/error out.
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
  } else {
    return generateWithPollinations(prompt);
  }
};
