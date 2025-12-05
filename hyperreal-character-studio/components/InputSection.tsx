import React, { useState, useRef } from 'react';
import { ArtStyle, LoadingState } from '../types';
import { SAMPLE_PROMPTS } from '../constants';
import Button from './Button';
import { Sparkles, Dice5, ChevronDown, Mic, Square, Loader2 } from 'lucide-react';
import { transcribeAudio, blobToBase64 } from '../services/geminiService';

interface InputSectionProps {
  onGenerate: (prompt: string, style: ArtStyle) => void;
  loadingState: LoadingState;
}

const InputSection: React.FC<InputSectionProps> = ({ onGenerate, loadingState }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ArtStyle.PHOTOREALISTIC);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt, selectedStyle);
    }
  };

  const handleRandom = () => {
    const random = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(random);
  };

  // --- Audio Logic ---
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Stop all tracks to release mic
            stream.getTracks().forEach(track => track.stop());
            
            setIsTranscribing(true);
            try {
                const base64Audio = await blobToBase64(audioBlob);
                const text = await transcribeAudio(base64Audio);
                setPrompt(prev => {
                    const separator = prev.trim() ? " " : "";
                    return prev + separator + text;
                });
            } catch (error) {
                console.error("Transcription error", error);
                alert("Voice recognition failed. Please try again.");
            } finally {
                setIsTranscribing(false);
            }
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const toggleRecording = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 shadow-2xl shadow-black/50">
      <div className="flex flex-col gap-4">
        {/* Header Label */}
        <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Character Manifest</label>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={toggleRecording} 
                    disabled={isTranscribing}
                    className={`flex items-center gap-1.5 text-xs transition-all duration-300 px-3 py-1 rounded-full border ${
                        isRecording 
                        ? 'text-red-200 bg-red-900/40 border-red-500/50 animate-pulse' 
                        : isTranscribing
                        ? 'text-indigo-300 bg-indigo-900/20 border-indigo-500/30'
                        : 'text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:border-zinc-500'
                    }`}
                >
                    {isRecording ? (
                        <>
                           <Square className="w-3 h-3 fill-current" />
                           <span className="font-mono font-bold">REC</span>
                        </>
                    ) : isTranscribing ? (
                        <>
                           <Loader2 className="w-3 h-3 animate-spin" />
                           <span className="font-mono">Processing...</span>
                        </>
                    ) : (
                        <>
                           <Mic className="w-3 h-3" />
                           <span>Voice Input</span>
                        </>
                    )}
                </button>
                <div className="w-px h-3 bg-zinc-800"></div>
                <button onClick={handleRandom} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Dice5 className="w-3 h-3" />
                    Randomize
                </button>
            </div>
        </div>

        {/* Text Input */}
        <div className="relative group">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your character (e.g., 25-year-old augmented reality designer...) or use Voice Input."
                className="w-full h-32 bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-sans text-base leading-relaxed transition-all"
                disabled={loadingState.status !== 'idle' && loadingState.status !== 'complete' && loadingState.status !== 'error'}
            />
            {/* Recording visual indicator inside area */}
            {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
            )}
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Style Selector */}
            <div className="relative w-full sm:w-64">
                <button 
                    onClick={() => setIsStyleOpen(!isStyleOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 hover:bg-zinc-750 transition-colors"
                >
                    <span className="truncate">{selectedStyle}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isStyleOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isStyleOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-20">
                        {Object.values(ArtStyle).map((style) => (
                            <button
                                key={style}
                                onClick={() => {
                                    setSelectedStyle(style);
                                    setIsStyleOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 transition-colors ${selectedStyle === style ? 'text-indigo-400 bg-zinc-800/50' : 'text-zinc-400'}`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Generate Button */}
            <Button 
                onClick={handleGenerate} 
                disabled={!prompt.trim() || isRecording || isTranscribing} 
                isLoading={loadingState.status === 'analyzing' || loadingState.status === 'generating'}
                className="w-full sm:w-auto min-w-[160px]"
            >
                {loadingState.status === 'analyzing' ? 'Analyzing Physiology...' : 
                 loadingState.status === 'generating' ? 'Rendering with Imagen...' : 
                 <>Generate Portrait <Sparkles className="ml-2 w-4 h-4" /></>}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default InputSection;