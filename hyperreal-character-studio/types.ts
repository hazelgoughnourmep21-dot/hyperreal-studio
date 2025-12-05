export interface CharacterAnalysis {
  visual_profile: {
    age_range: string;
    ethnicity_archetype: string;
    body_constitution: string; // Medical term for build
    facial_features: string;
    distinctive_marks: string; // Scars, tattoos, birthmarks
  };
  cinematography: {
    lighting_setup: string;
    color_grading: string;
    camera_angle: string;
    lens_choice: string;
  };
  narrative_elements: {
    expression_micro_details: string;
    clothing_texture: string;
    environmental_context: string;
    current_mood: string;
  };
  refined_prompt: string; // The optimized prompt for Imagen
}

export type ArmorStyle = 'Sci-Fi' | 'Medieval' | 'Modern';
export type Environment = 'Battlefield' | 'Rainy Tokyo' | 'Snowy Mountain';

export interface GenerationOverrides {
  armor?: ArmorStyle;
  environment?: Environment;
}

export interface GeneratedResult {
  imageUrls: string[]; // Changed to array to support multiple angles
  analysis: CharacterAnalysis;
  originalPrompt: string;
  style: string;
  timestamp: number;
  overrides?: GenerationOverrides;
}

export enum ArtStyle {
  PHOTOREALISTIC = "Photorealistic / Cinematic",
  MEDICAL_ILLUSTRATION = "Medical Concept Art",
  CYBERPUNK = "Cyberpunk / High Tech",
  NEO_NOIR = "Neo Noir / Mystery",
  ETHEREAL = "Ethereal / Fantasy",
  ROUGH_SKETCH = "Rough Concept Sketch"
}

export interface LoadingState {
  status: 'idle' | 'analyzing' | 'generating' | 'complete' | 'error';
  message?: string;
}