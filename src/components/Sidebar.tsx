import React from 'react';
import { TABS } from '../constants';
import { TabId } from '../types';
import { cn } from '../utils';
import { Sparkles, LogOut, User } from 'lucide-react';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="w-64 border-r border-neutral-800 flex flex-col h-full bg-neutral-950">
      <div className="p-6 flex items-center gap-3 border-b border-neutral-800">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Sparkles className="text-black w-5 h-5" />
        </div>
        <h1 className="font-bold text-lg tracking-tight text-white">GeminiX</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-4 px-2">
          AI Modules
        </div>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-left",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-neutral-500 group-hover:text-neutral-300")} />
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none mb-1">{tab.label}</span>
                <span className="text-[10px] opacity-60 leading-none">{tab.description}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
            <User className="w-5 h-5 text-neutral-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{user.name || 'User'}</span>
            <span className="text-[10px] text-neutral-500 truncate">{user.email}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Logout</span>
        </button>

        <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
          <div className="text-[10px] font-mono text-neutral-500 uppercase mb-2">Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Gemini Pro Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
