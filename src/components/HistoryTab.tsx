import React from 'react';
import { HistoryItem } from '../types';
import { cn, formatTimestamp } from '../utils';
import { History, Trash2, ExternalLink, FileText, Mic, Video, FileVideo, Volume2, FileAudio } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  'chat': FileText,
  'voice': Mic,
  'video-gen': Video,
  'video-analysis': FileVideo,
  'audio-gen': Volume2,
  'audio-transcribe': FileAudio,
};

export const HistoryTab: React.FC = () => {
  // In a real app, this would be fetched from localStorage or a database
  const history: HistoryItem[] = [
    { id: '1', type: 'chat', title: 'Quantum Physics Summary', timestamp: Date.now() - 3600000, data: {} },
    { id: '2', type: 'video-gen', title: 'Cyberpunk Cityscape', timestamp: Date.now() - 7200000, data: {} },
    { id: '3', type: 'audio-gen', title: 'Podcast Intro', timestamp: Date.now() - 86400000, data: {} },
  ];

  return (
    <div className="flex flex-col h-full p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">History</h2>
          <p className="text-neutral-500">Review and manage your previous interactions and generated media.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-neutral-800 text-[10px] font-mono uppercase tracking-widest text-neutral-600">
          <div className="col-span-1">Type</div>
          <div className="col-span-6">Title / Description</div>
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-600 space-y-4">
            <History className="w-12 h-12 opacity-20" />
            <p className="text-sm">No history found yet.</p>
          </div>
        ) : (
          history.map((item) => {
            const Icon = ICON_MAP[item.type] || FileText;
            return (
              <div 
                key={item.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-900/30 border border-neutral-800 rounded-2xl items-center hover:bg-neutral-900/50 transition-all group cursor-pointer"
              >
                <div className="col-span-1">
                  <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="col-span-6">
                  <h4 className="text-sm font-bold text-neutral-200">{item.title}</h4>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{item.type.replace('-', ' ')}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-xs font-mono text-neutral-500">{formatTimestamp(item.timestamp)}</span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button className="p-2 text-neutral-500 hover:text-emerald-400 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-neutral-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">Total Generations</div>
          <div className="text-3xl font-bold">124</div>
          <div className="text-[10px] text-emerald-500">+12% from last week</div>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">Media Stored</div>
          <div className="text-3xl font-bold">1.2 GB</div>
          <div className="text-[10px] text-neutral-500">Cloud Storage: 12% used</div>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">AI Tokens Used</div>
          <div className="text-3xl font-bold">42.5k</div>
          <div className="text-[10px] text-neutral-500">Reset in 12 days</div>
        </div>
      </div>
    </div>
  );
};
