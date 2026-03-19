import React, { useState, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { MODELS, VIDEO_MODELS_LIST } from '../constants';
import { cn } from '../utils';
import { 
  Video, 
  Loader2, 
  Download, 
  Play, 
  Info, 
  Sparkles, 
  Upload, 
  X,
  Film,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiKeyGuard } from './ApiKeyGuard';
import { VoiceInput } from './VoiceInput';

export const VideoGenTab: React.FC = () => {
  return <VideoGenTabContent />;
};

const VideoGenTabContent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(VIDEO_MODELS_LIST[0]);
  const [resolution, setResolution] = useState('720p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [withAudio, setWithAudio] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkText, setWatermarkText] = useState('AI Studio');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEnd: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEnd) setEndImage(reader.result as string);
        else setBaseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !baseImage) return;
    if (loading) return;

    // No premium key check needed for free tier models

    setLoading(true);
    setVideoUrl(null);
    setStatus('Initializing AI engine...');

    try {
      const statuses = [
        'Analyzing prompt...',
        'Generating keyframes...',
        'Rendering video frames...',
        'Applying motion vectors...',
        'Finalizing video file...'
      ];
      
      let statusIdx = 0;
      const interval = setInterval(() => {
        if (statusIdx < statuses.length) {
          setStatus(statuses[statusIdx++]);
        }
      }, 8000);

      const finalPrompt = watermarkEnabled 
        ? `${prompt}. Include a subtle text watermark that says "${watermarkText}" in the bottom right corner.`
        : prompt;

      let url;
      if (selectedModel.id.startsWith('fal-ai/')) {
        url = await gemini.generateFalVideo(finalPrompt, selectedModel.id, aspectRatio, baseImage || undefined, endImage || undefined, withAudio);
      } else {
        url = await gemini.generateVideo(finalPrompt, selectedModel.id, aspectRatio, baseImage || undefined, endImage || undefined);
      }
      
      clearInterval(interval);
      setVideoUrl(url);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        setStatus("Error: A paid API key is required for this model.");
        if (typeof window.aistudio?.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else {
        setStatus(`Error: ${error.message || 'Video generation failed.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Model Selection</label>
              <div className="grid grid-cols-1 gap-2">
                {VIDEO_MODELS_LIST.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      if (!model.res.includes(resolution)) {
                        setResolution(model.res[0]);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border text-sm transition-all",
                      selectedModel.id === model.id 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Film className={cn("w-4 h-4", selectedModel.id === model.id ? "text-emerald-400" : "text-neutral-500")} />
                      <div className="flex flex-col items-start">
                        <span>{model.name}</span>
                        <span className="text-[10px] text-neutral-600">{model.provider}</span>
                      </div>
                    </div>
                    {model.tier !== 'Free' && (
                      <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500 uppercase tracking-tighter">{model.tier}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {selectedModel.res.map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={cn(
                      "p-2 rounded-lg border text-xs font-medium transition-all",
                      resolution === res 
                        ? "bg-emerald-500 text-black border-emerald-500" 
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    )}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={cn(
                    "p-2 rounded-lg border text-xs font-medium transition-all",
                    aspectRatio === '16:9' 
                      ? "bg-emerald-500 text-black border-emerald-500" 
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  )}
                >
                  Landscape (16:9)
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={cn(
                    "p-2 rounded-lg border text-xs font-medium transition-all",
                    aspectRatio === '9:16' 
                      ? "bg-emerald-500 text-black border-emerald-500" 
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  )}
                >
                  Portrait (9:16)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">With Audio</label>
                <button
                  onClick={() => setWithAudio(!withAudio)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    withAudio ? "bg-emerald-500" : "bg-neutral-800"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      withAudio ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
              <p className="text-[10px] text-neutral-600">Generate AI audio synchronized with the video (Kling/Luma only).</p>
            </div>

            <div className="space-y-4 pt-2 border-t border-neutral-900">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Watermark</label>
                <button
                  onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    watermarkEnabled ? "bg-blue-500" : "bg-neutral-800"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      watermarkEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
              {watermarkEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <input 
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Watermark text..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <p className="text-[10px] text-neutral-600 italic">The AI will attempt to embed this text in the video.</p>
                </motion.div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Start Frame (Optional)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
                  baseImage ? "border-emerald-500/50" : "border-neutral-800 hover:border-neutral-700"
                )}
              >
                {baseImage ? (
                  <>
                    <img src={baseImage} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-xs text-white font-medium">Change Image</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setBaseImage(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-neutral-600 mb-2" />
                    <p className="text-xs text-neutral-500">Upload Start Photo</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleImageUpload(e, false)} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">End Frame (Optional)</label>
              <div 
                onClick={() => endFileInputRef.current?.click()}
                className={cn(
                  "relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
                  endImage ? "border-emerald-500/50" : "border-neutral-800 hover:border-neutral-700"
                )}
              >
                {endImage ? (
                  <>
                    <img src={endImage} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-xs text-white font-medium">Change Image</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEndImage(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-neutral-600 mb-2" />
                    <p className="text-xs text-neutral-500">Upload End Photo</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={endFileInputRef} 
                onChange={(e) => handleImageUpload(e, true)} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className={cn(
              "relative bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden flex items-center justify-center shadow-2xl",
              aspectRatio === '16:9' ? "aspect-video" : "aspect-[9/16] max-h-[600px] mx-auto"
            )}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 z-10"
                  >
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                      <Zap className="w-6 h-6 text-emerald-400 absolute top-0 right-0 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-emerald-500 font-mono text-xs uppercase tracking-widest mb-2 animate-pulse">{status}</p>
                      <p className="text-neutral-500 text-[10px] uppercase tracking-tighter">This can take up to 2 minutes</p>
                    </div>
                  </motion.div>
                ) : videoUrl ? (
                  <motion.div 
                    key="video"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full group"
                  >
                    <video 
                      src={videoUrl} 
                      controls 
                      className="w-full h-full object-contain"
                      autoPlay
                      loop
                    />
                    <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={videoUrl} 
                        download="generated-video.mp4"
                        className="p-3 bg-white text-black rounded-2xl hover:bg-neutral-200 transition-all shadow-xl flex items-center gap-2 font-medium text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    className="text-center space-y-4 px-12"
                  >
                    <div className="w-20 h-20 bg-neutral-950 rounded-full flex items-center justify-center border border-neutral-800 mx-auto">
                      <Video className="w-10 h-10 text-neutral-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-300">Cinematic AI Video</h3>
                      <p className="text-sm text-neutral-500">Describe a scene or upload a photo to animate it with VEO 3.1.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-lg">
              <div className="flex gap-4 relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the motion and scene... (e.g. 'A drone shot of a lush tropical island with waves crashing on the shore')"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none h-20 placeholder:text-neutral-600 pr-12"
                />
                <div className="absolute right-2 top-2">
                  <VoiceInput onTranscript={(t) => setPrompt(prev => prev + (prev ? ' ' : '') + t)} />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={(!prompt.trim() && !baseImage) || loading}
                  className="self-end px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
