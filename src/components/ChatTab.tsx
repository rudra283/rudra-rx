import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { openRouter } from '../services/openRouterService';
import { Message } from '../types';
import { cn, formatTimestamp } from '../utils';
import { Send, Loader2, Brain, Zap, Trash2, Search, ExternalLink, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceInput } from './VoiceInput';
import { OPENROUTER_MODELS_LIST } from '../constants';

interface ChatTabProps {
  incrementTrial?: () => void;
  isTrialExceeded?: boolean;
}

export const ChatTab: React.FC<ChatTabProps> = ({ incrementTrial, isTrialExceeded }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('geminix_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usePro, setUsePro] = useState(true);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [selectedORModel, setSelectedORModel] = useState<string | null>(null);
  const [showORMenu, setShowORMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableModels, setAvailableModels] = useState<any[]>(OPENROUTER_MODELS_LIST);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('geminix_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models/openrouter');
        const json = await response.json();
        const data = json.data || json;
        if (Array.isArray(data)) {
          const models = data.map((m: any) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            provider: m.id.split('/')[0]
          }));
          setAvailableModels(models);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleTranscript = (transcript: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + transcript);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Increment trial count if applicable
    if (incrementTrial) {
      incrementTrial();
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let response;
      if (selectedORModel) {
        response = await openRouter.chat(input, selectedORModel);
      } else {
        response = await gemini.chat(input, usePro, useThinking, useSearch);
      }
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || 'No response from AI.',
        timestamp: Date.now(),
        data: { grounding: (response as any).grounding }
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Error: ${error.message || "Failed to get response. Check console for details."}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = availableModels.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50 backdrop-blur-sm relative z-50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">AI Chat</h2>
          
          <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => {
                setUsePro(false);
                setSelectedORModel(null);
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                !usePro && !selectedORModel ? "bg-emerald-500 text-black" : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              <Zap className="w-3 h-3" />
              Flash
            </button>
            <button
              onClick={() => {
                setUsePro(true);
                setSelectedORModel(null);
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                usePro && !selectedORModel ? "bg-emerald-500 text-black" : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              <Brain className="w-3 h-3" />
              Pro
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowORMenu(!showORMenu)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                  selectedORModel ? "bg-blue-500 text-white" : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                {selectedORModel ? availableModels.find(m => m.id === selectedORModel)?.name : 'Model Selection'}
                <ChevronDown className={cn("w-3 h-3 transition-transform", showORMenu && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {showORMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden max-h-[500px] flex flex-col"
                  >
                    <div className="p-3 border-b border-neutral-800 bg-neutral-950/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                        <input 
                          type="text" 
                          placeholder="Search models or descriptions..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      {filteredModels.length > 0 ? (
                        filteredModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedORModel(model.id);
                              setShowORMenu(false);
                              setSearchTerm('');
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors border-b border-neutral-800/50 last:border-0 group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-neutral-200 group-hover:text-emerald-400 transition-colors">{model.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-500 uppercase font-bold tracking-wider">{model.provider}</span>
                            </div>
                            {model.description && (
                              <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed italic">
                                {model.description}
                              </p>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-xs text-neutral-500">No models found matching "{searchTerm}"</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {!selectedORModel && (
            <>
              <label className={cn(
                "flex items-center gap-2 cursor-pointer group transition-opacity",
                !usePro && "opacity-50 cursor-not-allowed"
              )}>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={useThinking} 
                    onChange={(e) => usePro && setUseThinking(e.target.checked)}
                    disabled={!usePro}
                  />
                  <div className={cn(
                    "block w-8 h-5 rounded-full transition-colors",
                    useThinking && usePro ? "bg-emerald-500" : "bg-neutral-700"
                  )} />
                  <div className={cn(
                    "absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform",
                    useThinking && usePro && "translate-x-3"
                  )} />
                </div>
                <span className="text-xs font-medium text-neutral-400 group-hover:text-neutral-200">Thinking</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={useSearch} 
                    onChange={(e) => setUseSearch(e.target.checked)}
                  />
                  <div className={cn(
                    "block w-8 h-5 rounded-full transition-colors",
                    useSearch ? "bg-emerald-500" : "bg-neutral-700"
                  )} />
                  <div className={cn(
                    "absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform",
                    useSearch && "translate-x-3"
                  )} />
                </div>
                <div className="flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-400 group-hover:text-neutral-200">Search</span>
                </div>
              </label>
            </>
          )}
        </div>
        
        <button 
          onClick={() => {
            setMessages([]);
            localStorage.removeItem('geminix_chat_history');
          }}
          className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-800">
              <Brain className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">GeminiX Intelligence</h3>
              <p className="text-neutral-500 text-sm">
                Ask anything. Use Gemini Pro, Flash, or select from a wide range of OpenRouter models.
              </p>
            </div>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-tighter">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </span>
                <span className="text-[10px] font-mono text-neutral-600">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-emerald-500 text-black font-medium" 
                  : "bg-neutral-900 border border-neutral-800 text-neutral-200"
              )}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.data?.grounding && (
                  <div className="mt-3 pt-3 border-t border-neutral-800/50 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.data.grounding.map((chunk: any, i: number) => (
                        chunk.web && (
                          <a 
                            key={i}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] text-neutral-300 transition-colors"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            {chunk.web.title || 'Source'}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="flex items-center gap-3 text-emerald-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest animate-pulse">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-neutral-800 bg-neutral-950">
        <div className="relative max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isTrialExceeded ? "Trial limit reached. Please sign in to continue." : "Type your message..."}
            className={cn(
              "w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 pr-24 text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none min-h-[60px] max-h-[200px]",
              isTrialExceeded && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
            disabled={isTrialExceeded}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <VoiceInput onTranscript={handleTranscript} className="p-0.5" disabled={isTrialExceeded} />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || isTrialExceeded}
              className="p-2.5 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span className="text-[10px] text-neutral-600 uppercase tracking-widest">
            Press Enter to send • Shift + Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};
