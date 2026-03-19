/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeTab } from './components/HomeTab';
import { ChatTab } from './components/ChatTab';
import { VoiceTab } from './components/VoiceTab';
import { ImageGenTab } from './components/ImageGenTab';
import { VideoGenTab } from './components/VideoGenTab';
import { VideoAnalysisTab } from './components/VideoAnalysisTab';
import { AudioGenTab } from './components/AudioGenTab';
import { AudioTranscribeTab } from './components/AudioTranscribeTab';
import { DocumentAssistantTab } from './components/DocumentAssistantTab';
import { HistoryTab } from './components/HistoryTab';
import { AdminTab } from './components/AdminTab';
import { SettingsTab } from './components/SettingsTab';
import { AuthOverlay } from './components/AuthOverlay';
import { TabId } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [trialCount, setTrialCount] = useState<number>(() => {
    const saved = localStorage.getItem('geminix_trial_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const TRIAL_LIMIT = 15;

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('geminix_trial_count', trialCount.toString());
  }, [trialCount]);

  const incrementTrial = () => {
    if (!user) {
      setTrialCount(prev => prev + 1);
    }
  };

  const renderTab = () => {
    const commonProps = { incrementTrial, isTrialExceeded: !user && trialCount >= TRIAL_LIMIT };
    
    switch (activeTab) {
      case 'home': return <HomeTab onTabChange={setActiveTab} />;
      case 'chat': return <ChatTab {...commonProps} />;
      case 'voice': return <VoiceTab />;
      case 'image-gen': return <ImageGenTab />;
      case 'video-gen': return <VideoGenTab />;
      case 'document-assistant': return <DocumentAssistantTab />;
      case 'video-analysis': return <VideoAnalysisTab />;
      case 'audio-gen': return <AudioGenTab />;
      case 'audio-transcribe': return <AudioTranscribeTab />;
      case 'history': return <HistoryTab />;
      case 'admin': return <AdminTab />;
      case 'settings': return <SettingsTab />;
      default: return <ChatTab {...commonProps} />;
    }
  };

  if (!isAuthReady) return null;

  const showAuth = !user && trialCount >= TRIAL_LIMIT;

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-200 font-sans overflow-hidden">
      <AnimatePresence>
        {showAuth && <AuthOverlay onAuth={setUser} />}
      </AnimatePresence>

      {/* Sidebar */}
      {activeTab !== 'home' && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col min-w-0 bg-neutral-950">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 relative z-10 h-full"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

