import React, { useState, useEffect } from 'react';
import { Key, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '../utils';

interface ApiKeyGuardProps {
  children: React.ReactNode;
  featureName: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children, featureName }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  const checkKey = async () => {
    if (typeof window.aistudio?.hasSelectedApiKey !== 'function') {
      setHasKey(true); // Fallback for environments without this API
      setChecking(false);
      return;
    }

    try {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } catch (err) {
      console.error("Error checking API key:", err);
      setHasKey(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (typeof window.aistudio?.openSelectKey !== 'function') return;
    
    try {
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race conditions
      setHasKey(true);
      // Force reload to ensure the new key is picked up from environment
      window.location.reload();
    } catch (err) {
      console.error("Error opening key selector:", err);
    }
  };

  const handleResetKey = async () => {
    if (typeof window.aistudio?.openSelectKey !== 'function') return;
    setHasKey(false);
    await handleSelectKey();
  };

  if (checking) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {children}
      {typeof window.aistudio?.openSelectKey === 'function' && (
        <button 
          onClick={handleResetKey}
          className="absolute top-4 right-4 p-2 bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg text-neutral-500 hover:text-emerald-400 transition-all z-50"
          title="Change API Key"
        >
          <Key className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
