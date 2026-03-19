import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { gemini } from '../services/geminiService';
import { cn, fileToBase64 } from '../utils';
import { FileAudio, Upload, Loader2, Search, CheckCircle2, AlertCircle, Mic, MicOff, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AudioTranscribeTab: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
      setTranscription(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [] },
    multiple: false
  });

  const handleTranscribe = async (fileToUse?: File) => {
    const file = fileToUse || audioFile;
    if (!file || loading) return;

    setLoading(true);
    setTranscription(null);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const result = await gemini.transcribeAudio(base64, file.type);
      setTranscription(result || 'No transcription generated.');
    } catch (err) {
      console.error(err);
      setError("Failed to transcribe audio. Ensure the file is not too large.");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], "recording.webm", { type: 'audio/webm' });
        setAudioFile(file);
        setAudioPreview(URL.createObjectURL(blob));
        handleTranscribe(file);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
  };

  const copyToClipboard = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Transcriber</h2>
        <p className="text-neutral-500">Upload audio files or record your voice to get accurate AI transcriptions instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Upload & Record */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4",
                isDragActive ? "border-emerald-500 bg-emerald-500/5" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700",
                audioPreview && "p-8 border-solid border-emerald-500/20"
              )}
            >
              <input {...getInputProps()} />
              
              {audioPreview ? (
                <div className="w-full space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mx-auto">
                    <FileAudio className="w-8 h-8 text-emerald-500" />
                  </div>
                  <audio src={audioPreview} controls className="w-full" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setAudioFile(null);
                      setAudioPreview(null);
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-widest font-mono"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-800">
                    <Upload className="w-8 h-8 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Drop audio here</p>
                    <p className="text-neutral-500 text-sm">or click to browse files</p>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-neutral-950 px-4 text-neutral-600 font-mono">Or Record Live</span>
              </div>
            </div>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "w-full py-6 rounded-3xl border flex flex-col items-center justify-center gap-3 transition-all group",
                isRecording 
                  ? "bg-red-500/10 border-red-500 text-red-400 animate-pulse" 
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-emerald-500/50 hover:text-emerald-400"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                isRecording ? "bg-red-500 text-white" : "bg-neutral-800 group-hover:bg-emerald-500 group-hover:text-black"
              )}>
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </div>
              <span className="text-sm font-bold tracking-tight">
                {isRecording ? "Stop Recording" : "Start Voice Recording"}
              </span>
            </button>
          </div>

          {audioFile && !isRecording && (
            <button
              onClick={() => handleTranscribe()}
              disabled={loading}
              className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? "Transcribing..." : "Transcribe Audio"}
            </button>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-500">Transcription</h3>
            <div className="flex items-center gap-4">
              {loading && (
                <div className="flex items-center gap-2 text-emerald-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-[10px] font-mono uppercase tracking-widest animate-pulse">Processing...</span>
                </div>
              )}
              {transcription && (
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-emerald-400 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              )}
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 min-h-[400px] relative overflow-hidden flex flex-col">
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
              ) : transcription ? (
                <motion.div 
                  key="transcription"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-neutral-200 leading-relaxed whitespace-pre-wrap"
                >
                  {transcription}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30"
                >
                  <FileAudio className="w-16 h-16 text-neutral-500" />
                  <p className="text-sm max-w-xs">Upload audio or record your voice to see transcription here.</p>
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
