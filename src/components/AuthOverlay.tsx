import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Loader2, Brain, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '../utils';
import * as THREE from 'three';

interface AuthOverlayProps {
  onAuth: (user: any) => void;
}

const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 15;
      colors[i] = Math.random();
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Floating Torus
    const torusGeometry = new THREE.TorusKnotGeometry(2, 0.6, 128, 16);
    const torusMaterial = new THREE.MeshNormalMaterial({ wireframe: true, transparent: true, opacity: 0.1 });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;
      torus.rotation.x += 0.002;
      torus.rotation.y += 0.003;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10 pointer-events-none" />;
};

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text);
        throw new Error(`Server Error: Received ${response.status}. Please check server logs.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-6 overflow-hidden">
      <ThreeBackground />
      
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px] animate-pulse" />

        <div className="relative bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="p-8 sm:p-12">
            <div className="flex flex-col items-center text-center mb-10">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-emerald-300 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-8"
              >
                <Brain className="w-10 h-10 text-black" />
              </motion.div>
              
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                {isLogin ? 'GeminiX' : 'Join Us'}
              </h2>
              <p className="text-neutral-400 text-sm font-medium">
                {isLogin ? 'The Ultimate AI Creative Suite' : 'Unlock your creative potential'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative"
                  >
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-neutral-600"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-neutral-600"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-neutral-600"
                  required
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2"
                >
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-emerald-500 text-black font-black py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-emerald-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="flex items-center justify-center gap-2 relative z-10">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? 'Enter Workspace' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-10 flex flex-col items-center gap-4">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span>{isLogin ? "New here? Create an account" : "Already have an account? Sign In"}</span>
                <Sparkles className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Secure AI Environment</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-neutral-800" />
                  <a 
                    href="https://t.me/iamhacker38" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] text-emerald-500/60 hover:text-emerald-500 uppercase tracking-[0.2em] font-bold transition-colors"
                  >
                    <span>Contact</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
