import React, { useState, useEffect } from 'react';
import { GeneratedResult, LoadingState, ArmorStyle, Environment } from '../types';
import { Download, RefreshCw, Copy, Grid, ZoomIn, ArrowLeft, Shield, Mountain } from 'lucide-react';
import Button from './Button';

interface ImageDisplayProps {
  result: GeneratedResult | null;
  loadingState: LoadingState;
  onRegenerate: () => void;
  onUpdateSettings: (armor: ArmorStyle, env: Environment) => void;
}

const ARMOR_OPTIONS: ArmorStyle[] = ['Sci-Fi', 'Medieval', 'Modern'];
const ENV_OPTIONS: Environment[] = ['Battlefield', 'Rainy Tokyo', 'Snowy Mountain'];

const ImageDisplay: React.FC<ImageDisplayProps> = ({ result, loadingState, onRegenerate, onUpdateSettings }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Local state for sliders to allow smooth dragging
  const [localArmorIdx, setLocalArmorIdx] = useState(0);
  const [localEnvIdx, setLocalEnvIdx] = useState(0);

  const isLoading = loadingState.status === 'analyzing' || loadingState.status === 'generating';

  // Sync local state with result if needed, or init default
  useEffect(() => {
    if (result && result.overrides) {
        // If result has overrides, sync slider positions
        if (result.overrides.armor) setLocalArmorIdx(ARMOR_OPTIONS.indexOf(result.overrides.armor));
        if (result.overrides.environment) setLocalEnvIdx(ENV_OPTIONS.indexOf(result.overrides.environment));
    }
  }, [result]);

  const handleSave = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `character-variant-${index + 1}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    if (result?.analysis.refined_prompt) {
        navigator.clipboard.writeText(result.analysis.refined_prompt);
    }
  };

  const handleSliderChange = (type: 'armor' | 'env', value: number) => {
      // Update local UI immediately
      if (type === 'armor') setLocalArmorIdx(value);
      if (type === 'env') setLocalEnvIdx(value);
  };

  const handleSliderCommit = () => {
      // Trigger regeneration on release (MouseUp)
      const armor = ARMOR_OPTIONS[localArmorIdx];
      const env = ENV_OPTIONS[localEnvIdx];
      onUpdateSettings(armor, env);
  };

  // If we are in "single view" mode and have a valid result
  const isSingleView = selectedIndex !== null && result;

  return (
    <div className="glass-panel rounded-2xl p-2 sm:p-4 shadow-2xl shadow-black/50 h-full flex flex-col">
      <div className="relative aspect-square w-full bg-black rounded-xl overflow-hidden border border-zinc-800 group">
        
        {/* Placeholder / Empty State */}
        {!result && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center mb-4">
                    <Grid className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm font-mono tracking-wide">AWAITING INPUT_</p>
            </div>
        )}

        {/* Loading State */}
        {isLoading && (
            <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                    {/* Ring 1 */}
                    <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                    {/* Ring 2 */}
                    <div className="absolute inset-4 border border-zinc-600/30 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
                    {/* Scanner */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-indigo-500/10 to-transparent animate-pulse"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-xs font-mono text-indigo-400 animate-pulse">
                            {loadingState.status === 'analyzing' ? 'NEURAL_ANALYSIS' : 'SYNTHESIZING X4'}
                         </span>
                    </div>
                </div>
                <div className="mt-8 font-mono text-xs text-zinc-500">
                    <span className="block text-center mb-1">{loadingState.message || 'Processing Request...'}</span>
                    <span className="block text-center text-zinc-600">Multi-View Generation</span>
                </div>
            </div>
        )}

        {/* Grid View */}
        {result && !isLoading && !isSingleView && (
            <div className="grid grid-cols-2 gap-1 w-full h-full bg-zinc-900">
                {result.imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group/item w-full h-full overflow-hidden cursor-pointer" onClick={() => setSelectedIndex(idx)}>
                        <img 
                            src={url} 
                            alt={`Variant ${idx + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                             <ZoomIn className="w-8 h-8 text-white/80 drop-shadow-lg" />
                        </div>
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleSave(url, idx); }}
                                className="p-2 bg-black/60 hover:bg-indigo-600 rounded-lg text-white backdrop-blur-sm transition-colors"
                                title="Save Image"
                             >
                                <Download className="w-4 h-4" />
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Single Full View */}
        {isSingleView && result && (
             <div className="w-full h-full relative">
                 <img 
                    src={result.imageUrls[selectedIndex!]} 
                    alt="Selected Variant" 
                    className="w-full h-full object-contain bg-zinc-900"
                 />
                 <div className="absolute top-4 left-4">
                     <button 
                        onClick={() => setSelectedIndex(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-md transition-colors text-sm font-medium border border-white/10"
                     >
                        <ArrowLeft className="w-4 h-4" /> Back to Grid
                     </button>
                 </div>
                 <div className="absolute bottom-4 right-4 flex gap-2">
                     <button 
                        onClick={() => handleSave(result.imageUrls[selectedIndex!], selectedIndex!)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg transition-colors text-sm font-medium"
                     >
                        <Download className="w-4 h-4" /> Save This
                     </button>
                 </div>
             </div>
        )}
        
      </div>

      {/* Controls & Modifiers */}
      {result && !isLoading && (
        <div className="mt-4 space-y-4">
            
            {/* Sliders Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                {/* Armor Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs uppercase font-mono tracking-wider text-zinc-500">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3"/> Armor Style</span>
                        <span className="text-indigo-400">{ARMOR_OPTIONS[localArmorIdx]}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="1"
                        value={localArmorIdx}
                        onChange={(e) => handleSliderChange('armor', parseInt(e.target.value))}
                        onMouseUp={handleSliderCommit}
                        onTouchEnd={handleSliderCommit}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                        <span>Sci-Fi</span>
                        <span>Medieval</span>
                        <span>Modern</span>
                    </div>
                </div>

                {/* Env Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs uppercase font-mono tracking-wider text-zinc-500">
                        <span className="flex items-center gap-1"><Mountain className="w-3 h-3"/> Environment</span>
                        <span className="text-indigo-400">{ENV_OPTIONS[localEnvIdx]}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="1"
                        value={localEnvIdx}
                        onChange={(e) => handleSliderChange('env', parseInt(e.target.value))}
                        onMouseUp={handleSliderCommit}
                        onTouchEnd={handleSliderCommit}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                        <span>Battle</span>
                        <span>Tokyo</span>
                        <span>Snow</span>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center px-1">
                <div className="flex gap-4 items-center">
                    <div className="text-xs text-zinc-500 font-mono">
                        {(Date.now() - result.timestamp) < 60000 ? 'Just now' : 'Processed'}
                    </div>
                    <Button variant="ghost" onClick={handleCopyPrompt} icon={<Copy className="w-4 h-4"/>} className="text-xs h-8">
                        Copy Prompt
                    </Button>
                </div>
                <Button variant="ghost" onClick={onRegenerate} icon={<RefreshCw className="w-4 h-4"/>}>
                    Regenerate Set
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;