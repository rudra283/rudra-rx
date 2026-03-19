import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Mic, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  FileVideo, 
  Volume2, 
  FileAudio,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  X,
  Instagram,
  FileCode
} from 'lucide-react';
import { motion } from 'motion/react';
import { TabId } from '../types';
import { cn } from '../utils';

interface HomeTabProps {
  onTabChange: (tab: TabId) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onTabChange }) => {
  const [activeModal, setActiveModal] = React.useState<'privacy' | 'terms' | 'contact' | 'docs' | null>(null);

  const features = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Context-aware conversations with real-time web search integration.' },
    { id: 'voice', label: 'Voice Assistant', icon: Mic, color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Natural, low-latency voice interactions powered by Gemini Live.' },
    { id: 'document-assistant', label: 'Doc Assistant', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'Upload PDFs to summarize, analyze, and generate knowledge tests.' },
    { id: 'image-gen', label: 'Image Studio', icon: ImageIcon, color: 'text-pink-400', bg: 'bg-pink-400/10', desc: 'Create stunning visual assets from text prompts using Imagen 4.' },
    { id: 'video-gen', label: 'Video Creator', icon: Video, color: 'text-orange-400', bg: 'bg-orange-400/10', desc: 'Generate cinematic video content with advanced motion control.' },
    { id: 'video-analysis', label: 'Video Insights', icon: FileVideo, color: 'text-cyan-400', bg: 'bg-cyan-400/10', desc: 'Extract deep insights and summaries from any video file or URL.' },
    { id: 'audio-gen', label: 'Speech Synth', icon: Volume2, color: 'text-yellow-400', bg: 'bg-yellow-400/10', desc: 'Convert text to life-like speech with multiple premium voices.' },
    { id: 'audio-transcribe', label: 'Transcriber', icon: FileAudio, color: 'text-red-400', bg: 'bg-red-400/10', desc: 'High-accuracy transcription for meetings, lectures, and more.' },
  ];

  const stats = [
    { label: 'Model Latency', value: '< 200ms', icon: Zap },
    { label: 'AI Accuracy', value: '99.9%', icon: CheckCircle2 },
    { label: 'Daily Requests', value: '1M+', icon: Activity },
    { label: 'Global Nodes', value: '50+', icon: Globe },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-950 overflow-y-auto scroll-smooth">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full px-6 py-4 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Sparkles className="text-black w-6 h-6" />
            </div>
            <h1 className="font-bold text-2xl tracking-tight text-white">GeminiX</h1>
          </button>
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] md:text-sm text-neutral-400 hover:text-white transition-colors uppercase tracking-widest font-mono">Features</button>
            <button onClick={() => document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] md:text-sm text-neutral-400 hover:text-white transition-colors uppercase tracking-widest font-mono">Security</button>
            <button onClick={() => onTabChange('chat')} className="px-3 md:px-5 py-1.5 md:py-2 bg-emerald-500 text-black rounded-full text-[10px] md:text-sm font-bold hover:bg-emerald-400 transition-all">Launch</button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Immersive Split Layout */}
      <section className="relative min-h-[80vh] flex items-center px-6 lg:px-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-3 h-3" />
              The Future of Multi-Modal AI
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9]"
            >
              One Platform. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600">Infinite Possibilities.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-neutral-400 max-w-xl leading-relaxed font-light"
            >
              Experience the world's most advanced AI suite. From real-time voice to cinematic video generation, everything you need is right here.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button 
                onClick={() => onTabChange('chat')}
                className="group px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-2xl shadow-white/10"
              >
                Launch Workspace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-neutral-900 text-white rounded-full font-bold border border-neutral-800 hover:bg-neutral-800 transition-all"
              >
                Explore Modules
              </button>
            </motion.div>
          </div>

          {/* Visual Showcase Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative mt-12 lg:mt-0"
          >
            <div className="relative aspect-square w-full max-w-lg mx-auto">
              {/* Glassmorphism Card Stack */}
              <div className="absolute top-0 right-0 w-4/5 h-4/5 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-[40px] backdrop-blur-3xl border border-white/10 shadow-2xl transform rotate-6" />
              <div className="absolute bottom-0 left-0 w-4/5 h-4/5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-[40px] backdrop-blur-3xl border border-white/10 shadow-2xl transform -rotate-3" />
              <div className="absolute inset-0 m-auto w-[90%] h-[90%] bg-neutral-900/80 rounded-[40px] backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 space-y-6">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center border border-emerald-500/30">
                  <Cpu className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold text-white">Gemini 3.1 Pro</h3>
                  <p className="text-neutral-500 text-sm uppercase tracking-widest">Active Neural Engine</p>
                </div>
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-neutral-500 uppercase">Tokens/sec</p>
                    <p className="text-lg font-bold text-white">120</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-neutral-500 uppercase">Context</p>
                    <p className="text-lg font-bold text-white">2M</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
        </motion.div>
      </section>

      {/* Stats Section - Clean Utility */}
      <section className="py-12 px-6 border-b border-neutral-900 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center space-y-2"
            >
              <stat.icon className="w-5 h-5 text-neutral-600 mb-2" />
              <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid - Modern Bento Style */}
      <section id="features" className="py-32 px-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Powerful Modules.</h2>
              <p className="text-neutral-500 max-w-md text-lg font-light">A comprehensive toolkit designed for the next generation of creators and professionals.</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              8 Core Engines Online
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onTabChange(feature.id as TabId)}
                className="group p-8 bg-neutral-900/40 border border-neutral-800 rounded-[32px] hover:border-emerald-500/50 hover:bg-neutral-900 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3", feature.bg)}>
                  <feature.icon className={cn("w-7 h-7", feature.color)} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.label}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-light mb-8 flex-1">{feature.desc}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  Open Engine
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                </div>
                
                {/* Decorative background glow */}
                <div className={cn("absolute -bottom-10 -right-10 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity", feature.bg)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 px-6 bg-neutral-900/10">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">How it Works.</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg font-light">Three simple steps to unlock the full potential of multi-modal AI.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Choose Module', desc: 'Select from our suite of specialized AI engines for chat, voice, image, or video.' },
              { step: '02', title: 'Input Content', desc: 'Provide your prompts, documents, or media files to the selected AI engine.' },
              { step: '03', title: 'Get Results', desc: 'Receive high-quality, context-aware outputs in seconds, ready for your projects.' }
            ].map((item, i) => (
              <div key={i} className="space-y-6 relative">
                <div className="text-8xl font-bold text-white/5 absolute -top-10 -left-4 select-none">{item.step}</div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-bold relative z-10">
                  {item.step}
                </div>
                <h4 className="text-2xl font-bold text-white relative z-10">{item.title}</h4>
                <p className="text-neutral-500 leading-relaxed font-light relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Free Focus */}
      <section className="py-32 px-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Simple Pricing.</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg font-light">Start building today with our generous free tier, or scale with enterprise features.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-10 bg-neutral-900/40 border border-emerald-500/30 rounded-[40px] space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <div className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-full">Current Plan</div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Free Explorer</h3>
                <p className="text-neutral-500 text-sm">Perfect for individuals and hobbyists.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-neutral-500">/month</span>
              </div>
              <ul className="space-y-4">
                {['Unlimited AI Chat', '100 Image Generations/day', 'Basic Video Analysis', 'Standard Voice Support', 'Community Access'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-neutral-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button onClick={() => onTabChange('chat')} className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-400 transition-all">Start Building</button>
            </div>
            
            {/* Pro Plan */}
            <div className="p-10 bg-neutral-900/20 border border-neutral-800 rounded-[40px] space-y-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Pro Studio</h3>
                <p className="text-neutral-500 text-sm">For professionals and small teams.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-neutral-500">/month</span>
              </div>
              <ul className="space-y-4">
                {['Everything in Free', 'Unlimited Image Studio', '4K Video Generation', 'Priority Neural Engine', 'API Access', '24/7 Support'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-neutral-400">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-neutral-800 text-white rounded-2xl font-bold hover:bg-neutral-700 transition-all">Coming Soon</button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security - Hardware Specialist Feel */}
      <section id="security" className="py-32 px-6 bg-neutral-900/20 border-y border-neutral-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Enterprise-Grade <br />Security & Privacy.</h2>
            <div className="space-y-6">
              {[
                { title: 'End-to-End Encryption', desc: 'Your data is encrypted at rest and in transit using industry-standard protocols.' },
                { title: 'Private Processing', desc: 'We never use your personal documents or conversations to train our base models.' },
                { title: 'Global Compliance', desc: 'Built to adhere to the strictest data protection regulations worldwide.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{item.title}</h4>
                    <p className="text-sm text-neutral-500 font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-video bg-neutral-900 rounded-[32px] border border-neutral-800 p-8 flex flex-col justify-between shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Shield className="w-16 h-16 text-emerald-500" />
                </motion.div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Security Protocol</p>
                  <h3 className="text-2xl font-bold text-white">Active Protection</h3>
                </div>
                <p className="text-sm text-neutral-400 font-light leading-relaxed">
                  Our proprietary real-time monitoring system that identifies and neutralizes potential threats before they reach your workspace. Continuous scanning ensures 100% data integrity.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { label: 'Threat Detection', value: 'Instant' },
                    { label: 'Data Isolation', value: 'Strict' },
                    { label: 'Access Control', value: 'RBAC' },
                    { label: 'Audit Logs', value: 'Enabled' }
                  ].map((s, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[8px] text-neutral-500 uppercase tracking-widest">{s.label}</p>
                      <p className="text-xs font-bold text-emerald-400">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Active Protection: Scanning...</p>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-600">v4.2.0-secure</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase">
                  <span>Encryption Strength</span>
                  <span>AES-256</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-emerald-500" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[
                    'https://picsum.photos/seed/user1/64/64',
                    'https://picsum.photos/seed/user2/64/64',
                    'https://picsum.photos/seed/user3/64/64'
                  ].map((src, i) => (
                    <img 
                      key={i} 
                      src={src} 
                      className="w-8 h-8 rounded-full border-2 border-neutral-900 bg-neutral-800 object-cover" 
                      referrerPolicy="no-referrer"
                      alt="User"
                    />
                  ))}
                </div>
                <p className="text-xs text-neutral-500 font-light">Trusted by 10,000+ organizations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-t from-emerald-500/10 to-transparent blur-3xl opacity-30" />
        </div>
        
        <div className="max-w-3xl mx-auto space-y-10 relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Ready to build <br />the future?</h2>
          <p className="text-xl text-neutral-400 font-light">Join thousands of users who are already leveraging the power of GeminiX to transform their workflow.</p>
          <button 
            onClick={() => onTabChange('chat')}
            className="px-12 py-5 bg-emerald-500 text-black rounded-full font-bold text-lg hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Sparkles className="text-black w-6 h-6" />
            </div>
            <h1 className="font-bold text-2xl tracking-tight text-white">GeminiX</h1>
          </div>
          
          <div className="flex gap-8 text-sm text-neutral-500 font-light">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors">Privacy</button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors">Terms</button>
            <button onClick={() => setActiveModal('contact')} className="hover:text-white transition-colors">Contact</button>
            <button onClick={() => setActiveModal('docs')} className="hover:text-white transition-colors">Documentation</button>
          </div>
          
          <p className="text-xs text-neutral-600 uppercase tracking-widest font-mono">
            © 2026 GeminiX AI Platform
          </p>
        </div>
      </footer>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-8 flex items-center justify-between border-b border-neutral-800">
              <h3 className="text-2xl font-bold text-white capitalize">
                {activeModal === 'docs' ? 'Documentation' : activeModal}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-neutral-400" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6 text-neutral-400 font-light leading-relaxed">
              {activeModal === 'privacy' && (
                <>
                  <p>At GeminiX, your privacy is our top priority. We implement state-of-the-art encryption and data handling practices to ensure your information remains secure.</p>
                  <h4 className="text-white font-bold">Data Collection</h4>
                  <p>We only collect data necessary to provide our AI services. This includes your account information and the prompts you provide to our engines.</p>
                  <h4 className="text-white font-bold">Data Usage</h4>
                  <p>Your data is used solely to generate AI responses. We do not sell your data to third parties or use it for advertising purposes.</p>
                </>
              )}
              
              {activeModal === 'terms' && (
                <>
                  <p>By using GeminiX, you agree to comply with our terms of service. Our platform is designed for ethical and creative use of AI technology.</p>
                  <h4 className="text-white font-bold">Usage Limits</h4>
                  <p>Free tier users are subject to daily limits on certain AI engines. Abuse of the platform or attempts to bypass these limits may result in account suspension.</p>
                  <h4 className="text-white font-bold">Content Ownership</h4>
                  <p>You retain ownership of the content you generate using our platform, subject to our fair use policies.</p>
                </>
              )}
              
              {activeModal === 'contact' && (
                <div className="space-y-8 text-center py-10">
                  <div className="space-y-2">
                    <p className="text-emerald-500 font-mono text-xs uppercase tracking-widest">Platform Creator</p>
                    <h4 className="text-4xl font-bold text-white">Shatarudra</h4>
                  </div>
                  <p className="text-neutral-400">Have questions or feedback? Reach out directly on Instagram for the fastest response.</p>
                  <a 
                    href="https://www.instagram.com/shatarudra_92" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:scale-105 transition-transform"
                  >
                    <Instagram className="w-6 h-6" />
                    @shatarudra_92
                  </a>
                </div>
              )}
              
              {activeModal === 'docs' && (
                <div className="space-y-8">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4">
                    <FileCode className="w-6 h-6 text-emerald-400 mt-1" />
                    <div>
                      <h4 className="text-white font-bold mb-2">Getting Started</h4>
                      <p className="text-sm">Learn how to navigate the GeminiX workspace and make the most of our multi-modal engines.</p>
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4">
                    <Zap className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                      <h4 className="text-white font-bold mb-2">API Reference</h4>
                      <p className="text-sm">Detailed documentation for developers looking to integrate GeminiX capabilities into their own apps.</p>
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4">
                    <Shield className="w-6 h-6 text-purple-400 mt-1" />
                    <div>
                      <h4 className="text-white font-bold mb-2">Best Practices</h4>
                      <p className="text-sm">Guidelines for prompt engineering and ethical AI usage to achieve the best results.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-neutral-800 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
