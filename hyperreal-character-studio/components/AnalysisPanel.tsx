import React from 'react';
import { CharacterAnalysis } from '../types';
import { Activity, Camera, Eye, User, FileText } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: CharacterAnalysis | null;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-white tracking-wide">Technical Analysis</h2>
            <div className="ml-auto text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                CLASS: {analysis.visual_profile.body_constitution.toUpperCase()}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Physiology */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">Physiology</span>
                </div>
                <div className="space-y-3">
                    <InfoItem label="Age" value={analysis.visual_profile.age_range} />
                    <InfoItem label="Archetype" value={analysis.visual_profile.ethnicity_archetype} />
                    <InfoItem label="Constitution" value={analysis.visual_profile.body_constitution} />
                    <InfoItem label="Features" value={analysis.visual_profile.facial_features} />
                    <InfoItem label="Distinctive" value={analysis.visual_profile.distinctive_marks} />
                </div>
            </div>

            {/* Column 2: Cinematography */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Camera className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">Cinematography</span>
                </div>
                <div className="space-y-3">
                    <InfoItem label="Lighting" value={analysis.cinematography.lighting_setup} />
                    <InfoItem label="Grading" value={analysis.cinematography.color_grading} />
                    <InfoItem label="Angle" value={analysis.cinematography.camera_angle} />
                    <InfoItem label="Lens" value={analysis.cinematography.lens_choice} />
                </div>
            </div>

             {/* Column 3: Narrative */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">Narrative Detail</span>
                </div>
                <div className="space-y-3">
                    <InfoItem label="Expression" value={analysis.narrative_elements.expression_micro_details} />
                    <InfoItem label="Materials" value={analysis.narrative_elements.clothing_texture} />
                    <InfoItem label="Context" value={analysis.narrative_elements.environmental_context} />
                    <InfoItem label="Mood" value={analysis.narrative_elements.current_mood} />
                </div>
            </div>
        </div>

        {/* Refined Prompt Display */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
             <div className="flex items-center gap-2 text-zinc-400 mb-3">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider">System Prompt (Imagen Optimized)</span>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-zinc-800">
                <p className="text-xs text-zinc-400 font-mono leading-relaxed break-all">
                    {analysis.refined_prompt}
                </p>
            </div>
        </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="group">
        <dt className="text-[10px] uppercase text-zinc-600 font-bold mb-0.5">{label}</dt>
        <dd className="text-sm text-zinc-300 border-l-2 border-zinc-800 pl-2 group-hover:border-indigo-500/50 transition-colors">{value}</dd>
    </div>
);

export default AnalysisPanel;