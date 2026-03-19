import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { openRouter } from '../services/openRouterService';
import { MODELS } from '../constants';
import { cn } from '../utils';
import { 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  Sparkles, 
  Layers, 
  Maximize, 
  Upload,
  X,
  Search,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceInput } from './VoiceInput';

const GEMINI_IMAGE_MODELS = [
  { id: MODELS.IMAGE_FREE, name: 'Nano Banana (Free/Fast)', sizes: ['512px', '1K'], premium: false, provider: 'gemini' },
  { id: MODELS.IMAGE_FLASH, name: 'Nano Banana 2', sizes: ['512px', '1K', '2K', '4K'], premium: true, provider: 'gemini' },
  { id: MODELS.IMAGE_PRO, name: 'Nano Banana Pro', sizes: ['1K', '2K', '4K'], premium: true, provider: 'gemini' },
];

export const ImageGenTab: React.FC = () => {
  return <ImageGenTabContent />;
};

const ImageGenTabContent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<any>(GEMINI_IMAGE_MODELS[0]);
  const [selectedSize, setSelectedSize] = useState('1K');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [openRouterModels, setOpenRouterModels] = useState<any[]>([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/models/openrouter')
      .then(res => res.json())
      .then(json => {
        const data = json.data || json;
        const models = data.map((m: any) => ({
          id: m.id,
          name: m.name,
          sizes: ['1K'],
          premium: false,
          provider: 'openrouter',
          description: m.description
        }));
        setOpenRouterModels(models);
      })
      .catch(err => console.error("Failed to fetch OpenRouter models", err));
  }, []);

  const filteredModels = [
    ...GEMINI_IMAGE_MODELS,
    ...openRouterModels.filter(m => 
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) || 
      m.id.toLowerCase().includes(modelSearch.toLowerCase())
    ).sort((a, b) => {
      // Prioritize known image models
      const imageKeywords = ['stable-diffusion', 'flux', 'midjourney', 'dall-e', 'imagen', 'recraft', 'black-forest-labs'];
      const aIsImage = imageKeywords.some(k => a.id.toLowerCase().includes(k));
      const bIsImage = imageKeywords.some(k => b.id.toLowerCase().includes(k));
      
      if (aIsImage && !bIsImage) return -1;
      if (!aIsImage && bIsImage) return 1;
      
      // Secondary sort by name
      return a.name.localeCompare(b.name);
    })
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBaseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      let result: string;
      if (selectedModel.provider === 'gemini') {
        // Check if key is needed for premium models
        if (selectedModel.premium) {
          const hasKey = typeof window.aistudio?.hasSelectedApiKey === 'function' 
            ? await window.aistudio.hasSelectedApiKey() 
            : true;
          
          if (!hasKey && typeof window.aistudio?.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
          }
        }

        result = await gemini.generateImage(
          prompt, 
          selectedModel.id, 
          selectedSize as any, 
          aspectRatio,
          baseImage || undefined
        );
      } else {
        // OpenRouter Image Generation
        result = await openRouter.generateImage(prompt, selectedModel.id);
      }
      setResultImage(result);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        alert("A paid API key is required for this model. Please select one.");
        if (typeof window.aistudio?.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else {
        alert(error.message || "Failed to generate image.");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `generated-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Model Name</label>
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900 text-sm text-neutral-200 hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="truncate">{selectedModel.name}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showModelDropdown && "rotate-180")} />
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
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <input
                            type="text"
                            value={modelSearch}
                            onChange={(e) => setModelSearch(e.target.value)}
                            placeholder="Search models..."
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-1">
                        {filteredModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model);
                              setShowModelDropdown(false);
                              if (!model.sizes.includes(selectedSize)) {
                                setSelectedSize(model.sizes[0]);
                              }
                            }}
                            className={cn(
                              "w-full flex flex-col items-start p-3 rounded-lg text-left transition-all hover:bg-neutral-800",
                              selectedModel.id === model.id ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
                            )}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-sm font-medium">{model.name}</span>
                              <span className="text-[10px] opacity-50 uppercase tracking-widest">{model.provider}</span>
                            </div>
                            {model.description && (
                              <p className="text-[10px] opacity-40 line-clamp-1">{model.description}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Resolution / Size</label>
              <div className="grid grid-cols-2 gap-2">
                {selectedModel.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "p-2 rounded-lg border text-xs font-medium transition-all",
                      selectedSize === size 
                        ? "bg-emerald-500 text-black border-emerald-500" 
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '4:3', '16:9', '9:16', '3:4'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      "p-2 rounded-lg border text-xs font-medium transition-all",
                      aspectRatio === ratio 
                        ? "bg-emerald-500 text-black border-emerald-500" 
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Image Reference (Optional)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
                  baseImage ? "border-emerald-500/50" : "border-neutral-800 hover:border-neutral-700"
                )}
              >
                {baseImage ? (
                  <>
                    <img src={baseImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                    <p className="text-xs text-neutral-500">Upload Reference</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative aspect-square bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden flex items-center justify-center shadow-2xl">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                      <Sparkles className="w-4 h-4 text-emerald-400 absolute top-0 right-0 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-neutral-200">Generating Masterpiece...</p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">This usually takes 10-20 seconds</p>
                    </div>
                  </motion.div>
                ) : resultImage ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-full group"
                  >
                    <img src={resultImage} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={downloadImage}
                        className="p-3 bg-white text-black rounded-2xl hover:bg-neutral-200 transition-all shadow-xl flex items-center gap-2 font-medium text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    className="text-center space-y-4 px-12"
                  >
                    <div className="w-20 h-20 bg-neutral-950 rounded-full flex items-center justify-center border border-neutral-800 mx-auto">
                      <ImageIcon className="w-10 h-10 text-neutral-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-300">Ready to Create?</h3>
                      <p className="text-sm text-neutral-500">Enter a prompt below and let the AI bring your imagination to life.</p>
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
                  placeholder="Describe what you want to see... (e.g. 'A futuristic cyberpunk city at sunset with neon lights')"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none h-20 placeholder:text-neutral-600 pr-12"
                />
                <div className="absolute right-2 top-2">
                  <VoiceInput onTranscript={(t) => setPrompt(prev => prev + (prev ? ' ' : '') + t)} />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || loading}
                  className="self-end px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
