import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { openRouter } from '../services/openRouterService';
import { cn } from '../utils';
import { Volume2, Loader2, Download, Play, Pause, Info, User, Sparkles, Search, ChevronDown, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceInput } from './VoiceInput';

const VOICES = [
  { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Warm & Professional' },
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Friendly & Casual' },
  { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Deep & Authoritative' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Calm & Steady' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Clear & Energetic' },
];

export const AudioGenTab: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [loading, setLoading] = useState(false);
  const [generatingText, setGeneratingText] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openRouterModels, setOpenRouterModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/models/openrouter')
      .then(res => res.json())
      .then(json => {
        const data = json.data || json;
        setOpenRouterModels(data);
        if (data.length > 0) setSelectedModel(data[0]);
      })
      .catch(err => console.error("Failed to fetch OpenRouter models", err));
  }, []);

  const filteredModels = openRouterModels.filter(m => 
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) || 
    m.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleGenerateText = async () => {
    if (!selectedModel || generatingText) return;
    setGeneratingText(true);
    try {
      const prompt = `Generate a short, engaging paragraph about ${text || 'something interesting'} that would sound good when spoken. Max 100 words.`;
      const result = await openRouter.chat(prompt, selectedModel.id);
      setText(result.text);
    } catch (error) {
      console.error(error);
      alert("Failed to generate text with OpenRouter.");
    } finally {
      setGeneratingText(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const base64 = await gemini.generateSpeech(text, selectedVoice);
      if (base64) {
        const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col h-full p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Speech Synthesizer</h2>
          <p className="text-neutral-500">Convert any text into natural-sounding speech using Gemini's TTS engine.</p>
        </div>
        
        {/* OpenRouter Model Selection for Text Generation */}
        <div className="w-64 space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Model Name</label>
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full flex items-center justify-between p-2 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-200 hover:border-neutral-700 transition-all"
            >
              <span className="truncate">{selectedModel?.name || 'Loading...'}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform text-neutral-500", showModelDropdown && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showModelDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2 border-bottom border-neutral-800">
                    <input
                      type="text"
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="Search models..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 px-3 text-[10px] focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    {filteredModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelDropdown(false);
                        }}
                        className={cn(
                          "w-full flex flex-col items-start p-2 rounded-lg text-left transition-all hover:bg-neutral-800",
                          selectedModel?.id === model.id ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
                        )}
                      >
                        <span className="text-[11px] font-medium">{model.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500">Text Input</label>
                <button
                  onClick={handleGenerateText}
                  disabled={generatingText || !selectedModel}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest disabled:opacity-50"
                >
                  {generatingText ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  AI Write
                </button>
              </div>
              <VoiceInput onTranscript={(t) => setText(prev => prev + (prev ? ' ' : '') + t)} />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech... or use 'AI Write' to generate a script."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-lg focus:outline-none focus:border-emerald-500/50 transition-all min-h-[300px] resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] text-neutral-600 uppercase tracking-widest">{text.length} characters</span>
              <button 
                onClick={() => setText('')}
                className="text-[10px] text-neutral-600 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!text.trim() || loading}
            className="w-full bg-emerald-500 text-black font-bold py-5 rounded-2xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-emerald-500/10"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className="w-6 h-6" />}
            {loading ? "Synthesizing..." : "Generate Speech"}
          </button>
        </div>

        {/* Right: Voice Selection & Preview */}
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500">Select Voice</label>
            <div className="space-y-2">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                    selectedVoice === voice.id 
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    selectedVoice === voice.id ? "bg-emerald-500 text-black" : "bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700"
                  )}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold">{voice.name}</span>
                      <span className="text-[10px] opacity-60 uppercase tracking-tighter">{voice.gender}</span>
                    </div>
                    <p className="text-[10px] opacity-60">{voice.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {audioUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Audio Ready</span>
                  <div className="flex gap-2">
                    <a 
                      href={audioUrl} 
                      download="gemini-x-speech.mp3"
                      className="p-2 text-neutral-400 hover:text-emerald-400 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 bg-emerald-500 text-black rounded-full flex items-center justify-center hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                  <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: isPlaying ? '100%' : '0%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
                
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-neutral-400">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest">Usage Info</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Synthesized audio is high-fidelity 24kHz. Perfect for podcasts, narrations, or accessibility features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
