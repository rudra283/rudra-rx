import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Lock, 
  Activity, 
  Users, 
  Database, 
  Zap, 
  Trash2, 
  Plus, 
  Network,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import * as d3 from 'd3';

const ADMIN_KEY = 'SHATARUDRA@12';

export const AdminTab: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_KEY) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Access Key');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 bg-neutral-900 rounded-[32px] border border-neutral-800 shadow-2xl space-y-8"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Admin Access</h2>
              <p className="text-neutral-500 text-sm">Enter the master key to access the control panel.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-neutral-500 ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-[10px] uppercase tracking-widest ml-1">{error}</p>}
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
            >
              Unlock Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard />;
};

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'activity' | 'connectivity' | 'features'>('overview');
  
  return (
    <div className="flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-900 flex items-center justify-between bg-neutral-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Shield className="text-black w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">GeminiX Admin</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">System Control Panel v1.0.4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
          {[
            { id: 'overview', label: 'Overview', icon: Zap },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'connectivity', label: 'Connectivity', icon: Network },
            { id: 'features', label: 'Features', icon: Plus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                activeView === tab.id 
                  ? "bg-emerald-500 text-black shadow-lg" 
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeView === 'overview' && <OverviewView key="overview" />}
          {activeView === 'activity' && <ActivityView key="activity" />}
          {activeView === 'connectivity' && <ConnectivityView key="connectivity" />}
          {activeView === 'features' && <FeaturesView key="features" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

const OverviewView: React.FC = () => {
  const stats = [
    { label: 'Total Users', value: '12,482', icon: Users, color: 'text-blue-400' },
    { label: 'Active Sessions', value: '842', icon: Zap, color: 'text-yellow-400' },
    { label: 'API Calls / min', value: '3,240', icon: Activity, color: 'text-emerald-400' },
    { label: 'Storage Used', value: '4.2 TB', icon: Database, color: 'text-purple-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-3xl space-y-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/5", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 bg-neutral-900/50 border border-neutral-800 rounded-[32px] space-y-6">
          <h3 className="text-xl font-bold text-white">System Health</h3>
          <div className="h-64 flex items-end gap-2">
            {[40, 60, 45, 80, 55, 90, 70, 85, 60, 75, 50, 65, 95, 80, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-lg relative group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-lg transition-all group-hover:bg-emerald-400"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
        </div>

        <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-[32px] space-y-6">
          <h3 className="text-xl font-bold text-white">Top Models</h3>
          <div className="space-y-4">
            {[
              { name: 'Gemini 3.1 Pro', usage: 45 },
              { name: 'Imagen 4', usage: 25 },
              { name: 'VEO 3.1 Fast', usage: 20 },
              { name: 'Kling 2.5 Turbo', usage: 10 },
            ].map((m, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-300">{m.name}</span>
                  <span className="text-emerald-500 font-bold">{m.usage}%</span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${m.usage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ActivityView: React.FC = () => {
  const activities = [
    { user: 'ushadevi221204@gmail.com', action: 'Generated Video', model: 'VEO 3.1 Fast', time: '2 mins ago' },
    { user: 'shatarudra_92', action: 'Created Image', model: 'Imagen 4', time: '15 mins ago' },
    { user: 'ushadevi221204@gmail.com', action: 'Chat Session', model: 'Gemini 3.1 Pro', time: '1 hour ago' },
    { user: 'guest_4821', action: 'Voice Interaction', model: 'Gemini Live', time: '3 hours ago' },
    { user: 'shatarudra_92', action: 'Video Analysis', model: 'Gemini 1.5 Pro', time: '5 hours ago' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-[32px] space-y-8"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Live User Activity</h3>
        <button className="text-xs text-emerald-500 font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors">Export Logs</button>
      </div>

      <div className="space-y-4">
        {activities.map((a, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800/50 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 font-bold">
                {a.user[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{a.user}</p>
                <p className="text-xs text-neutral-500">{a.action} using <span className="text-neutral-400">{a.model}</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-600 font-mono">{a.time}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-500/50 uppercase font-bold">Success</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const ConnectivityView: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    const nodes = [
      { id: 'User', group: 1, x: 50, y: 200 },
      { id: 'GeminiX Gateway', group: 2, x: 200, y: 200 },
      { id: 'Auth Service', group: 3, x: 350, y: 100 },
      { id: 'Neural Engine', group: 3, x: 350, y: 200 },
      { id: 'Storage Engine', group: 3, x: 350, y: 300 },
      { id: 'Gemini 3.1 Pro', group: 4, x: 550, y: 100 },
      { id: 'Imagen 4', group: 4, x: 550, y: 175 },
      { id: 'VEO 3.1', group: 4, x: 550, y: 250 },
      { id: 'External APIs', group: 4, x: 550, y: 325 },
      { id: 'Output Buffer', group: 5, x: 750, y: 200 },
    ];

    const links = [
      { source: 'User', target: 'GeminiX Gateway' },
      { source: 'GeminiX Gateway', target: 'Auth Service' },
      { source: 'GeminiX Gateway', target: 'Neural Engine' },
      { source: 'GeminiX Gateway', target: 'Storage Engine' },
      { source: 'Neural Engine', target: 'Gemini 3.1 Pro' },
      { source: 'Neural Engine', target: 'Imagen 4' },
      { source: 'Neural Engine', target: 'VEO 3.1' },
      { source: 'Neural Engine', target: 'External APIs' },
      { source: 'Gemini 3.1 Pro', target: 'Output Buffer' },
      { source: 'Imagen 4', target: 'Output Buffer' },
      { source: 'VEO 3.1', target: 'Output Buffer' },
      { source: 'External APIs', target: 'Output Buffer' },
      { source: 'Output Buffer', target: 'User' },
    ];

    // Draw links
    svg.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', d => nodes.find(n => n.id === d.source)!.x)
      .attr('y1', d => nodes.find(n => n.id === d.source)!.y)
      .attr('x2', d => nodes.find(n => n.id === d.target)!.x)
      .attr('y2', d => nodes.find(n => n.id === d.target)!.y)
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', d => d.target === 'User' ? '5,5' : '0');

    // Draw nodes
    const nodeGroups = svg.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodeGroups.append('circle')
      .attr('r', 12)
      .attr('fill', d => {
        if (d.group === 1) return '#fff';
        if (d.group === 2) return '#10b981';
        if (d.group === 3) return '#3b82f6';
        if (d.group === 4) return '#8b5cf6';
        return '#f59e0b';
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

    nodeGroups.append('text')
      .text(d => d.id)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Animate data flow
    const animateFlow = () => {
      svg.selectAll('.flow-dot').remove();
      
      links.forEach((link, i) => {
        const source = nodes.find(n => n.id === link.source)!;
        const target = nodes.find(n => n.id === link.target)!;
        
        svg.append('circle')
          .attr('class', 'flow-dot')
          .attr('r', 3)
          .attr('fill', '#10b981')
          .attr('cx', source.x)
          .attr('cy', source.y)
          .transition()
          .duration(2000)
          .delay(i * 200)
          .attr('cx', target.x)
          .attr('cy', target.y)
          .on('end', animateFlow);
      });
    };

    animateFlow();

  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-[32px] space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Tool Connectivity Diagram</h3>
          <p className="text-sm text-neutral-500">Visualizing the flow of data across GeminiX infrastructure.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Gateway</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Service</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-[10px] text-neutral-500 uppercase font-mono">AI Model</span>
          </div>
        </div>
      </div>

      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-4 overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto" />
      </div>
    </motion.div>
  );
};

const FeaturesView: React.FC = () => {
  const [features, setFeatures] = useState([
    { id: 1, name: 'Real-time Web Search', status: 'Active', type: 'Core' },
    { id: 2, name: 'Multi-modal Reasoning', status: 'Active', type: 'Core' },
    { id: 3, name: 'Cinematic Video Gen', status: 'Active', type: 'Premium' },
    { id: 4, name: 'Voice Synthesis', status: 'Active', type: 'Core' },
    { id: 5, name: 'Advanced PDF Analysis', status: 'Beta', type: 'Pro' },
  ]);

  const removeFeature = (id: number) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Feature Management</h3>
        <button className="px-6 py-2 bg-emerald-500 text-black rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Feature
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.id} className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-3xl space-y-6 group">
            <div className="flex items-center justify-between">
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                f.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"
              )}>
                {f.status}
              </div>
              <button 
                onClick={() => removeFeature(f.id)}
                className="p-2 text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white">{f.name}</h4>
              <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-1">{f.type} Module</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-neutral-400">Stable</span>
              </div>
              <button className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1">
                Config
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        
        <div className="p-6 border-2 border-dashed border-neutral-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 hover:border-neutral-700 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-600 group-hover:text-emerald-500 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500">Deploy Module</p>
            <p className="text-[10px] text-neutral-600 uppercase tracking-widest">Add to Production</p>
          </div>
        </div>
      </div>

      <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[32px] flex items-start gap-6">
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-white">Danger Zone</h4>
          <p className="text-sm text-neutral-500">Modifying core features can impact all active users. Ensure you have backed up the current system state before making changes.</p>
          <div className="flex gap-4 pt-2">
            <button className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all">Flush System Cache</button>
            <button className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all">Reboot Neural Engine</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
