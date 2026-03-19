import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { gemini } from '../services/geminiService';
import { cn, fileToBase64 } from '../utils';
import { FileVideo, Upload, Loader2, Search, CheckCircle2, AlertCircle, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceInput } from './VoiceInput';
import { ApiKeyGuard } from './ApiKeyGuard';

export const VideoAnalysisTab: React.FC = () => {
  return (
    <ApiKeyGuard featureName="AI Video Analysis">
      <VideoAnalysisTabContent />
    </ApiKeyGuard>
  );
};

const VideoAnalysisTabContent: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Summarize this video and identify key moments.');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranscript = (transcript: string) => {
    setPrompt(prev => prev + (prev ? ' ' : '') + transcript);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!videoFile || loading) return;

    setLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      const base64 = await fileToBase64(videoFile);
      const result = await gemini.analyzeVideo(base64, videoFile.type, prompt);
      setAnalysis(result || 'No analysis generated.');
    } catch (err) {
      console.error(err);
      setError("Failed to analyze video. Ensure the file is not too large.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Video Insights</h2>
        <p className="text-neutral-500">Upload any video and let Gemini Pro understand its content, extract data, and answer questions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Upload & Preview */}
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4",
              isDragActive ? "border-emerald-500 bg-emerald-500/5" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700",
              videoPreview && "p-4 border-solid border-emerald-500/20"
            )}
          >
            <input {...getInputProps()} />
            
            {videoPreview ? (
              <div className="w-full relative group">
                <video src={videoPreview} controls className="w-full rounded-2xl shadow-2xl" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                    setVideoPreview(null);
                  }}
                  className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Change Video
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-800">
                  <Upload className="w-8 h-8 text-neutral-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Drop video here</p>
                  <p className="text-neutral-500 text-sm">or click to browse files</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-neutral-600 pt-4">
                  <span>MP4, WEBM, MOV</span>
                  <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                  <span>MAX 20MB</span>
                </div>
              </>
            )}
          </div>

          {videoFile && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <FileVideo className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{videoFile.name}</p>
                  <p className="text-[10px] text-neutral-500 uppercase">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500">Analysis Prompt</label>
                <div className="relative">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="What would you like to know about this video?"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 pr-32 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                  <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                    <VoiceInput onTranscript={handleTranscript} className="p-0.5" />
                    <button
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="px-4 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-2 h-full"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      <span className="text-xs font-bold uppercase tracking-tight">Analyze</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Analysis Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-500">Analysis Result</h3>
            {loading && (
              <div className="flex items-center gap-2 text-emerald-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-mono uppercase tracking-widest animate-pulse">Processing Video...</span>
              </div>
            )}
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 min-h-[400px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4"
                >
                  <AlertCircle className="w-12 h-12 text-red-500 opacity-50" />
                  <p className="text-red-400 text-sm max-w-xs">{error}</p>
                </motion.div>
              ) : analysis ? (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-invert prose-emerald max-w-none"
                >
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30"
                >
                  <Search className="w-16 h-16 text-neutral-500" />
                  <p className="text-sm max-w-xs">Upload a video and click analyze to see AI insights here.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decorative Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
