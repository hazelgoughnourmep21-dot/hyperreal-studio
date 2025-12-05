import { ArtStyle } from './types';

export const STYLE_PROMPTS: Record<ArtStyle, string> = {
  [ArtStyle.PHOTOREALISTIC]: "Shot on ARRI Alexa LF, 85mm lens, f/1.8, cinematic lighting, ultra-detailed skin texture, subsurface scattering, hyper-realistic, 8k resolution, raw photo.",
  [ArtStyle.MEDICAL_ILLUSTRATION]: "High-end medical illustration, anatomical precision, clean neutral background, detailed muscle definition, soft studio lighting, clinical aesthetic, highly detailed rendering.",
  [ArtStyle.CYBERPUNK]: "Neon lighting, chromatic aberration, high tech implants, rain-slicked surfaces, volumetric fog, futuristic fashion, synthwave palette, ray tracing.",
  [ArtStyle.NEO_NOIR]: "Chiaroscuro lighting, high contrast, film grain, dramatic shadows, muted colors, smoke, moody atmosphere, cinematic masterpiece.",
  [ArtStyle.ETHEREAL]: "Soft focus, dreamlike atmosphere, particle effects, divine lighting, pastel colors, flowing fabrics, intricate details, fantasy concept art.",
  [ArtStyle.ROUGH_SKETCH]: "Concept art style, loose brushwork, charcoal textures, artistic lighting, expressive strokes, detailed focal point, neutral canvas background."
};

export const NEGATIVE_PROMPT = "blur, low quality, distortion, bad anatomy, extra fingers, missing limbs, fused fingers, watermark, text, signature, cartoon, 3d render, plastic skin, doll-like, oversaturated, ugly, deformed, noisy, grainy, low resolution, jpeg artifacts";

export const SAMPLE_PROMPTS = [
  "30-year-old female programmer working late in a cafe, tired but focused.",
  "Weathered Viking warrior standing on a snowy peak, battle scars.",
  "Futuristic field medic in a chaotic battlefield triage, high tech gear.",
  "Elderly jazz musician playing saxophone in a smoky bar, melancholic."
];