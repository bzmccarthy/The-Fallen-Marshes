import { GoogleGenAI, Modality } from "@google/genai";
import { Character } from '../types';

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Uses a text model to rewrite character stats into a specific artistic prompt.
 * Now enforces distinct artistic mediums to ensure visual variety.
 */
export const enhancePrompt = async (character: Character, targetMood: string): Promise<string> => {
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
    return `A close-up face portrait of a ${gender} ${occupation} named ${name}, ${physicalDesc}, ${oddity ? oddity : 'industrial fantasy'}, ${targetMood} style.`;
  }
};

/**
 * Generates the actual image using Gemini 2.5 Flash Image.
 * This uses the generateContent API with responseModalities: ['IMAGE'].
 */
export const generateCharacterPortrait = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    
    if (!part || !part.inlineData) {
      console.warn("Full API Response for debugging:", JSON.stringify(response, null, 2));
      throw new Error("No image data returned from API. The prompt may have triggered safety filters.");
    }

    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};