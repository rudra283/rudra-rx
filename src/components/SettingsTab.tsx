import React from 'react';
import { Settings, Key, Bell, Shield, Globe, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export const SettingsTab: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-neutral-500">Manage your account preferences and API configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Key className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-white">API Configuration</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500 ml-1">Gemini API Key</label>
              <input 
                type="password"
                value="••••••••••••••••"
                readOnly
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none"
              />
              <p className="text-[10px] text-neutral-600 ml-1 italic">Managed via System Secrets</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Cpu className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Model Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Default Model</span>
              <select className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                <option>Gemini 3.1 Pro</option>
                <option>Gemini 3.1 Flash</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Response Speed</span>
              <select className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                <option>Optimized</option>
                <option>Fastest</option>
                <option>Balanced</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-neutral-900/30 border border-neutral-800/50 rounded-[32px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-neutral-500" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Privacy & Security</h4>
            <p className="text-sm text-neutral-500">Your data is encrypted and never used for training.</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-neutral-800 text-white rounded-xl font-bold text-sm hover:bg-neutral-700 transition-all">
          Manage Privacy
        </button>
      </div>
    </div>
  );
};
