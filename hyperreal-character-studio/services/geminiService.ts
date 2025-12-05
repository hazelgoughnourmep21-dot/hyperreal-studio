import { GoogleGenAI, Type } from "@google/genai";
import { CharacterAnalysis, ArtStyle, GenerationOverrides } from "../types";
import { STYLE_PROMPTS, NEGATIVE_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper for timeout
const timeout = (ms: number) => new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
});

// Helper to convert Blob to Base64 (cleaned)
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// 0. Transcribe Audio (Speech to Text)
export const transcribeAudio = async (audioBase64: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: "audio/webm", // MediaRecorder defaults to webm usually
                            data: audioBase64
                        }
                    },
                    {
                        text: "Transcribe the audio exactly as spoken. It describes a character. Detect the language (Chinese or English) automatically. Return ONLY the transcribed text, no other commentary."
                    }
                ]
            }
        });
        
        return response.text || "";
    } catch (error) {
        console.error("Transcription failed:", error);
        throw error;
    }
}

// 1. First, analyze the user request to create a "Medical/Concept" profile and a better prompt
export const analyzeCharacterRequest = async (
  userPrompt: string,
  style: ArtStyle
): Promise<CharacterAnalysis> => {
  
  const systemInstruction = `
    You are a world-class Concept Art Director and Medical Illustrator. 
    Your task is to take a simple character description and expand it into a highly detailed technical profile.
    
    1. Analyze the character for anatomical accuracy, lighting, and narrative details.
    2. Create a 'refined_prompt' that is optimized for image generation. 
       - It MUST be in English.
       - It MUST include keywords for texture, lighting, and camera settings.
       - It MUST align with the requested style: ${style}.
       - Do not include markdown code blocks in the string.
  `;

  // Using gemini-2.5-flash as it is the standard for text tasks
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visual_profile: {
            type: Type.OBJECT,
            properties: {
              age_range: { type: Type.STRING },
              ethnicity_archetype: { type: Type.STRING },
              body_constitution: { type: Type.STRING, description: "Medical description of build (e.g., Ectomorph, Hypertrophic)" },
              facial_features: { type: Type.STRING },
              distinctive_marks: { type: Type.STRING },
            }
          },
          cinematography: {
            type: Type.OBJECT,
            properties: {
              lighting_setup: { type: Type.STRING },
              color_grading: { type: Type.STRING },
              camera_angle: { type: Type.STRING },
              lens_choice: { type: Type.STRING },
            }
          },
          narrative_elements: {
            type: Type.OBJECT,
            properties: {
              expression_micro_details: { type: Type.STRING },
              clothing_texture: { type: Type.STRING },
              environmental_context: { type: Type.STRING },
              current_mood: { type: Type.STRING },
            }
          },
          refined_prompt: { type: Type.STRING, description: "The final prompt to send to the image generator." }
        },
        required: ["visual_profile", "cinematography", "narrative_elements", "refined_prompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate character analysis.");
  return JSON.parse(text) as CharacterAnalysis;
};

// 2. Generate 4 variations of the image
export const generateCharacterImages = async (
  analysis: CharacterAnalysis,
  style: ArtStyle,
  overrides?: GenerationOverrides
): Promise<string[]> => {
  const styleKeywords = STYLE_PROMPTS[style];
  
  // Inject overrides if present
  const armorContext = overrides?.armor ? `WEARING HEAVY ${overrides.armor.toUpperCase()} ARMOR/SUIT, DETAILED GEAR` : '';
  const envContext = overrides?.environment ? `BACKGROUND IS ${overrides.environment.toUpperCase()}, CINEMATIC ATMOSPHERE` : '';

  // Define 4 distinct variations for the character
  const variations = [
      "Cinematic Frontal Portrait, direct eye contact",
      "Three-Quarter Angle (45 degrees), dynamic pose",
      "Side Profile (90 degrees), dramatic silhouette",
      "Close-up Detail Shot, focus on eyes and expression"
  ];

  // Function to generate a single image variation
  const generateSingleVariation = async (variation: string): Promise<string> => {
      // If overrides exist, they take precedence over original narrative texture/context
      const clothing = overrides?.armor ? armorContext : analysis.narrative_elements.clothing_texture;
      const environment = overrides?.environment ? envContext : analysis.cinematography.lighting_setup;

      const finalPrompt = `
        ${styleKeywords}
        SUBJECT: ${analysis.refined_prompt}.
        VIEW/ANGLE: ${variation}.
        DETAILS: ${analysis.visual_profile.facial_features}, ${analysis.visual_profile.body_constitution}.
        OUTFIT: ${clothing}.
        ENVIRONMENT: ${environment}.
        LIGHTING: ${analysis.cinematography.lighting_setup}.
        (masterpiece), (best quality), (ultra-detailed), (photorealistic:1.4), (8k), (hdr).
      `.trim();

      try {
        // Using gemini-2.5-flash-image
        const requestPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash-image', 
          contents: {
            parts: [{ text: finalPrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        });

        const response = await Promise.race([
            requestPromise,
            timeout(60000)
        ]);

        let base64Image = null;
        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    base64Image = part.inlineData.data;
                    break;
                }
            }
        }
        
        if (!base64Image) {
            throw new Error("No image data returned from Gemini for variation.");
        }

        return `data:image/jpeg;base64,${base64Image}`;
      } catch (error) {
        console.error(`Error generating variation '${variation}':`, error);
        throw error;
      }
  };

  // Run all 4 generations in parallel
  try {
      const results = await Promise.all(variations.map(v => generateSingleVariation(v)));
      return results;
  } catch (error) {
      console.error("Batch generation failed:", error);
      throw error;
  }
};