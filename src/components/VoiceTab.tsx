import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { MODELS } from '../constants';
import { cn } from '../utils';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { ApiKeyGuard } from './ApiKeyGuard';

export const VoiceTab: React.FC = () => {
  return (
    <ApiKeyGuard featureName="Gemini Live Voice">
      <VoiceTabContent />
    </ApiKeyGuard>
  );
};

const VoiceTabContent: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  const startSession = async () => {
    setStatus('connecting');
    setError(null);

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      
      sessionRef.current = await ai.live.connect({
        model: MODELS.LIVE,
        callbacks: {
          onopen: () => {
            setStatus('active');
            startAudioCapture();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const audioData = Int16Array.from(atob(base64Audio), c => c.charCodeAt(0));
              audioQueue.current.push(audioData);
              if (!isPlaying.current) playNextInQueue();
            }

            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              setTranscript(prev => [...prev, `AI: ${message.serverContent?.modelTurn?.parts?.[0]?.text}`]);
            }

            if (message.serverContent?.interrupted) {
              audioQueue.current = [];
              isPlaying.current = false;
            }
          },
          onclose: () => {
            stopSession();
          },
          onerror: (err) => {
            console.error(err);
            setError("Connection error. Please try again.");
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful, friendly AI assistant. Keep responses concise and conversational.",
        },
      });
    } catch (err) {
      console.error(err);
      setError("Failed to connect to Gemini Live.");
      setStatus('error');
    }
  };

  const startAudioCapture = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        if (isMuted || !sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
    } catch (err) {
      console.error(err);
      setError(
        <div className="flex flex-col items-center gap-2">
          <p>Microphone access denied by system.</p>
          <button 
            onClick={() => window.open(window.location.href, '_blank')}
            className="text-[10px] underline hover:text-white transition-colors"
          >
            Try opening in a new tab
          </button>
        </div> as any
      );
      stopSession();
    }
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const pcmData = audioQueue.current.shift()!;
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
    buffer.getChannelData(0).set(floatData);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  const stopSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    setStatus('idle');
    setIsActive(false);
    audioQueue.current = [];
    isPlaying.current = false;
  };

  const toggleSession = () => {
    if (isActive) stopSession();
    else {
      setIsActive(true);
      startSession();
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <div className="max-w-2xl w-full flex flex-col items-center gap-12">
        
        {/* Visualizer Area */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <AnimatePresence>
            {status === 'active' && (
              <>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 0.2 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                  className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 0.4 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse', delay: 0.5 }}
                  className="absolute inset-4 bg-emerald-400 rounded-full blur-2xl"
                />
              </>
            )}
          </AnimatePresence>

          <button
            onClick={toggleSession}
            disabled={status === 'connecting'}
            className={cn(
              "relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
              status === 'active' 
                ? "bg-emerald-500 text-black scale-110" 
                : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-emerald-500/50"
            )}
          >
            {status === 'connecting' ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : status === 'active' ? (
              <Mic className="w-12 h-12" />
            ) : (
              <MicOff className="w-12 h-12" />
            )}
          </button>
        </div>

        {/* Info & Controls */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">
            {status === 'active' ? "Listening..." : "Voice Assistant"}
          </h2>
          <p className="text-neutral-500 max-w-sm mx-auto">
            {status === 'active' 
              ? "Talk naturally with Gemini. It understands your voice and responds in real-time."
              : "Click the microphone to start a live voice conversation with Gemini."}
          </p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={status !== 'active'}
              className={cn(
                "p-3 rounded-xl border transition-all",
                isMuted 
                  ? "bg-red-500/10 border-red-500/30 text-red-400" 
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
              )}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              className="p-3 rounded-xl border bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-all"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Status Card */}
        <div className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Live Session Info</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-600 uppercase">Model</div>
              <div className="text-xs font-medium">Gemini 2.5 Flash Native Audio</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-600 uppercase">Latency</div>
              <div className="text-xs font-medium text-emerald-500">Ultra-Low</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-600 uppercase">Voice</div>
              <div className="text-xs font-medium">Zephyr (Prebuilt)</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-600 uppercase">Sample Rate</div>
              <div className="text-xs font-medium">16kHz In / 24kHz Out</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
