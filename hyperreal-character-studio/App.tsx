import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ImageDisplay from './components/ImageDisplay';
import AnalysisPanel from './components/AnalysisPanel';
import { ArtStyle, GeneratedResult, LoadingState, ArmorStyle, Environment } from './types';
import { analyzeCharacterRequest, generateCharacterImages } from './services/geminiService';
import { X, Globe, Terminal, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);

  const processGeneration = async (
    prompt: string, 
    style: ArtStyle, 
    overrides?: { armor?: ArmorStyle; environment?: Environment },
    skipAnalysis: boolean = false
  ) => {
    try {
      let analysis = result?.analysis;

      // Step 1: Analyze Text (only if not skipping or no previous analysis)
      if (!skipAnalysis || !analysis) {
          setLoadingState({ status: 'analyzing', message: 'Deconstructing Prompt...' });
          analysis = await analyzeCharacterRequest(prompt, style);
      }

      if (!analysis) throw new Error("No analysis available");

      // Step 2: Generate Images with Retry Mechanism
      setLoadingState({ status: 'generating', message: 'Synthesizing 4 Variations...' });
      
      let imageUrls: string[] = [];
      const MAX_RETRIES = 3;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            if (attempt > 1) {
                setLoadingState({ status: 'generating', message: `Synthesizing Visuals (Attempt ${attempt}/${MAX_RETRIES})...` });
            }
            // Pass overrides to the generation function
            imageUrls = await generateCharacterImages(analysis, style, overrides);
            break;
        } catch (error) {
            console.warn(`Generation attempt ${attempt} failed:`, error);
            if (attempt === MAX_RETRIES) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // Step 3: Complete
      setResult({
        imageUrls,
        analysis,
        originalPrompt: prompt,
        style,
        timestamp: Date.now(),
        overrides // Store overrides in result to persist slider state
      });
      setLoadingState({ status: 'complete' });

    } catch (error) {
      console.error("Workflow failed:", error);
      setLoadingState({ status: 'error', message: 'Failed to generate character.' });
      alert("服务器繁忙，请 30 秒后重试");
    }
  };

  const handleGenerateClick = (prompt: string, style: ArtStyle) => {
      // New generation from scratch
      processGeneration(prompt, style);
  };

  const handleRegenerate = () => {
    if (result) {
        // Regenerate with existing overrides if any
        processGeneration(result.originalPrompt, result.style as ArtStyle, result.overrides, true);
    }
  };

  const handleUpdateSettings = (armor: ArmorStyle, env: Environment) => {
      if (result) {
          // Update settings implies re-generating images only, skipping text analysis
          processGeneration(
              result.originalPrompt, 
              result.style as ArtStyle, 
              { armor, environment: env }, 
              true // Skip analysis for speed
          );
      }
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-zinc-200 selection:bg-indigo-500/30">
      <Header onDeployClick={() => setShowDeployModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Top Section: Split Layout (Input + Image) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[500px]">
            
            {/* Input Side (Left) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="prose prose-invert">
                    <h2 className="text-3xl font-bold tracking-tighter text-white mb-2">
                        Visualize <span className="text-indigo-500">Unseen</span> Characters
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Transform rough ideas into photorealistic concept art. 
                        Our engine uses medical-grade anatomical knowledge and cinematic lighting physics to render characters that feel alive.
                    </p>
                </div>
                <InputSection 
                    onGenerate={handleGenerateClick} 
                    loadingState={loadingState}
                />
            </div>

            {/* Image Side (Right) */}
            <div className="lg:col-span-7 h-full">
                <ImageDisplay 
                    result={result} 
                    loadingState={loadingState}
                    onRegenerate={handleRegenerate}
                    onUpdateSettings={handleUpdateSettings}
                />
            </div>
        </div>

        {/* Bottom Section: Analysis Panel */}
        {result && (
            <AnalysisPanel analysis={result.analysis} />
        )}

      </main>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Deployment Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowDeployModal(false)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-1">Production Deployment</h3>
                <p className="text-zinc-400 text-sm mb-6">Your studio is ready for the world.</p>

                <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4 items-start p-4 bg-black/40 rounded-xl border border-zinc-800/50">
                        <div className="p-2 bg-zinc-800 rounded-lg shrink-0">
                            <Terminal className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-200">1. Download & Install</h4>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Download this project ZIP. Run <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">npm install</code> locally to set up the build environment.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 items-start p-4 bg-black/40 rounded-xl border border-zinc-800/50">
                         <div className="p-2 bg-zinc-800 rounded-lg shrink-0">
                            <Zap className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-zinc-200">2. Deploy to Vercel</h4>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Connect your Git repo to Vercel. Don't forget to add your <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">API_KEY</code> in Vercel's Environment Variables settings.
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Domain Hint */}
                    <div className="flex gap-4 items-start p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                         <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                            <Globe className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-indigo-200">Pro Tip: Custom Domain</h4>
                            <p className="text-xs text-indigo-300/70 mt-1 leading-relaxed">
                                Assign a custom domain (e.g., <strong>studio.design</strong>) in Vercel Settings. 
                                <br/><span className="opacity-70 mt-1 block">Effect: Enables Global Edge CDN & Professional Branding.</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => setShowDeployModal(false)}
                        className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;