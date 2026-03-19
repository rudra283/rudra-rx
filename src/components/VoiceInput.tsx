import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  className?: string;
  placeholder?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, className, placeholder }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
        setError(null);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'audio-capture') {
          setError("No microphone found.");
        } else if (event.error === 'not-allowed') {
          setError("Microphone access denied.");
        } else {
          setError(`Speech error: ${event.error}`);
        }
        
        setTimeout(() => setError(null), 3000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onTranscript]);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setIsListening(true);
      recognitionRef.current.start();
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No microphone detected.");
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('denied')) {
        setError("Permission denied. Try opening in a new tab.");
      } else {
        setError("Mic access failed.");
      }
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 left-0 right-0 bg-red-500 text-white text-[10px] py-1 px-2 rounded text-center whitespace-nowrap z-50"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={toggleListening}
        className={cn(
          "p-2 rounded-lg transition-all flex items-center justify-center",
          isListening 
            ? "bg-red-500 text-white animate-pulse" 
            : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
        )}
        title={isListening ? "Stop Listening" : placeholder || "Voice Input"}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    </div>
  );
};
