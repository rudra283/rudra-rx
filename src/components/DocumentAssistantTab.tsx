import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { gemini } from '../services/geminiService';
import { 
  FileText, 
  Upload, 
  Loader2, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  X,
  ChevronRight,
  Sparkles,
  ClipboardCheck,
  Trophy,
  List,
  BookOpen,
  Brain,
  Volume2,
  Layers,
  Zap,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  FileCode,
  Workflow,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface AnalysisResult {
  toc: string;
  fullSummary: string;
  bulletSummary: string;
  tldr: string;
  takeaways: string;
  connections: string;
  glossary: { term: string; definition: string }[];
  advancedQuestions: { question: string; answer: string }[];
  flashcards: { front: string; back: string }[];
  revisionNotes: string;
  workflows: string;
  visuals: string;
}

type ActiveTab = 'summary' | 'toc-glossary' | 'study' | 'workflows' | 'chat' | 'quiz';

export const DocumentAssistantTab: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [summaryType, setSummaryType] = useState<'full' | 'bullet' | 'tldr'>('bullet');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setPdfBase64(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setError("Please upload a valid PDF file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!pdfBase64) return;
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are an Ultimate AI Document Assistant & Tutor. Analyze the uploaded PDF and provide a comprehensive response in JSON format.
      
      The JSON should have the following structure:
      {
        "toc": "Automatic Table of Contents with sections and subheadings",
        "fullSummary": "Detailed explanation of all sections",
        "bulletSummary": "Easy scanning of key points in bullet format",
        "tldr": "1-2 line overview for instant understanding",
        "takeaways": "Key takeaways per section",
        "connections": "Analysis of connections and recurring themes throughout the document",
        "glossary": [{"term": "string", "definition": "string"}],
        "advancedQuestions": [{"question": "string", "answer": "string"}],
        "flashcards": [{"front": "string", "back": "string"}],
        "revisionNotes": "Structured revision notes",
        "workflows": "Step-by-step instructions for any processes/methods in the PDF",
        "visuals": "Suggestions for diagrams, tables, or flowcharts for complex sections"
      }

      Rules:
      - Never invent content. Stick to PDF.
      - Use structured markdown within the strings where appropriate.
      - Ensure the glossary includes important terms, definitions, and formulas.
      - Advanced questions should be comprehension, analytical, and scenario-based.
      - Highlight recurring themes and how different sections connect.
      
      Only return the JSON object.`;

      const result = await gemini.analyzeDocument(pdfBase64, prompt);
      const cleanedResult = result.replace(/```json|```/g, '').trim();
      const analysisData = JSON.parse(cleanedResult);
      setAnalysis(analysisData);
      setActiveTab('summary');
    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async (text: string) => {
    if (!text || isAudioLoading) return;
    setIsAudioLoading(true);
    try {
      const base64Audio = await gemini.generateSpeech(text.substring(0, 5000)); // Limit for TTS
      if (base64Audio) {
        const url = `data:audio/mp3;base64,${base64Audio}`;
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error("Audio generation failed:", err);
      setError("Failed to generate audio.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!pdfBase64) return;
    setLoading(true);
    setError(null);
    try {
      const prompt = `Based on the uploaded PDF, generate a 5-question multiple choice quiz to test the reader's understanding. 
      Return the response in JSON format as an array of objects, where each object has:
      - question: string
      - options: array of 4 strings
      - correctAnswer: index of the correct option (0-3)
      - explanation: a brief explanation of why the answer is correct based on the PDF.
      
      Only return the JSON array.`;

      const result = await gemini.analyzeDocument(pdfBase64, prompt);
      const cleanedResult = result.replace(/```json|```/g, '').trim();
      const quizData = JSON.parse(cleanedResult);
      setQuiz(quizData);
      setCurrentQuestion(0);
      setScore(0);
      setShowResults(false);
      setSelectedOption(null);
      setIsAnswered(false);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === quiz![currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < quiz!.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Chat Session
  const [chatSession, setChatSession] = useState<any>(null);

  useEffect(() => {
    if (pdfBase64 && activeTab === 'chat' && !chatSession) {
      const session = gemini.createChatSession(pdfBase64);
      setChatSession(session);
    }
  }, [pdfBase64, activeTab, chatSession]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !pdfBase64 || loading) return;

    const userMessage = input.trim();
    setInput('');
    setChat(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      let responseText = "";
      if (chatSession) {
        const response = await chatSession.sendMessage({ message: userMessage });
        responseText = response.text;
      } else {
        responseText = await gemini.analyzeDocument(pdfBase64, userMessage);
      }
      setChat(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (err: any) {
      console.error(err);
      setError("Failed to get answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPdfBase64(null);
    setAnalysis(null);
    setChat([]);
    setQuiz(null);
    setError(null);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  const ensureString = (val: any) => Array.isArray(val) ? val.join('\n') : String(val || '');

  return (
    <div className="flex flex-col h-full bg-neutral-950 overflow-hidden">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-emerald-500" />
              Ultimate AI Document Assistant
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">Analyze, summarize, and master any PDF with advanced learning tools, interactive Q&A, and voice output.</p>
          </div>

          {!pdfBase64 ? (
            <div 
              {...getRootProps()} 
              className={cn(
                "relative aspect-[21/7] rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden",
                isDragActive ? "border-emerald-500 bg-emerald-500/5" : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/50"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <input {...getInputProps()} />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-neutral-950 rounded-3xl flex items-center justify-center border border-neutral-800 mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                  <Upload className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white mb-2">Drop your PDF here</p>
                  <p className="text-neutral-500">or click to browse files from your computer</p>
                </div>
              </div>
              <div className="absolute bottom-8 flex items-center gap-3 text-xs text-neutral-600 uppercase tracking-widest font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                  <span>OCR Enabled</span>
                </div>
                <div className="w-1 h-1 bg-neutral-800 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                  <span>Context Memory</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-neutral-900/80 backdrop-blur-xl p-5 rounded-[32px] border border-neutral-800 shadow-2xl">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <FileText className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{file?.name}</p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                      <span>{(file?.size || 0) / 1024 / 1024 < 1 ? `${Math.round((file?.size || 0) / 1024)} KB` : `${((file?.size || 0) / 1024 / 1024).toFixed(1)} MB`}</span>
                      <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                      <span className="text-emerald-500/80 uppercase tracking-widest">Ready for Analysis</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {!analysis && (
                    <button
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="px-8 py-3 bg-emerald-500 text-black rounded-2xl font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      Start Full Analysis
                    </button>
                  )}
                  {analysis && (
                    <button
                      onClick={handleGenerateQuiz}
                      disabled={loading}
                      className="px-8 py-3 bg-blue-500 text-white rounded-2xl font-bold text-sm hover:bg-blue-400 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                      Interactive Quiz
                    </button>
                  )}
                  <button
                    onClick={reset}
                    className="p-3 bg-neutral-800 text-neutral-400 rounded-2xl hover:bg-neutral-700 transition-all border border-neutral-700/50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm"
                >
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </motion.div>
              )}

              {analysis && !quiz && (
                <div className="space-y-6">
                  {/* Navigation Tabs */}
                  <div className="flex items-center gap-2 p-1.5 bg-neutral-900 rounded-2xl border border-neutral-800 w-fit">
                    {[
                      { id: 'summary', label: 'Summary', icon: BookOpen },
                      { id: 'toc-glossary', label: 'TOC & Glossary', icon: List },
                      { id: 'study', label: 'Study Tools', icon: Brain },
                      { id: 'workflows', label: 'Workflows', icon: Workflow },
                      { id: 'chat', label: 'Interactive Q&A', icon: MessageSquare },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                        className={cn(
                          "px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                          activeTab === tab.id 
                            ? "bg-emerald-500 text-black shadow-lg" 
                            : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                        )}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-12">
                      <AnimatePresence mode="wait">
                        {activeTab === 'summary' && (
                          <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                          >
                            <div className="bg-neutral-900 rounded-[32px] border border-neutral-800 p-8 shadow-xl">
                              <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                                  {[
                                    { id: 'bullet', label: 'Bullet Points' },
                                    { id: 'full', label: 'Full Summary' },
                                    { id: 'tldr', label: 'TL;DR' },
                                  ].map((type) => (
                                    <button
                                      key={type.id}
                                      onClick={() => setSummaryType(type.id as any)}
                                      className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        summaryType === type.id ? "bg-emerald-500 text-black" : "text-neutral-500"
                                      )}
                                    >
                                      {type.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-3">
                                  {audioUrl ? (
                                    <div className="flex items-center gap-2 bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800">
                                      <button onClick={toggleAudio} className="text-emerald-500 hover:text-emerald-400">
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                      </button>
                                      <button onClick={() => { if(audioRef.current) audioRef.current.currentTime = 0; }} className="text-neutral-500 hover:text-white">
                                        <RotateCcw className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleGenerateAudio(summaryType === 'bullet' ? analysis.bulletSummary : summaryType === 'full' ? analysis.fullSummary : analysis.tldr)}
                                      disabled={isAudioLoading}
                                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-xs font-bold uppercase tracking-widest"
                                    >
                                      {isAudioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                                      Listen to Summary
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="prose prose-invert prose-emerald max-w-none">
                                <div className="markdown-body">
                                  <ReactMarkdown>
                                    {ensureString(summaryType === 'bullet' ? analysis.bulletSummary : summaryType === 'full' ? analysis.fullSummary : analysis.tldr)}
                                  </ReactMarkdown>
                                </div>
                              </div>

                              <div className="mt-12 pt-8 border-t border-neutral-800">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-emerald-500 mb-6">Key Takeaways</h4>
                                    <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800/50">
                                      <div className="text-sm text-neutral-400 leading-relaxed">
                                        <ReactMarkdown>
                                          {ensureString(analysis.takeaways)}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-blue-500 mb-6">Connections & Themes</h4>
                                    <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800/50">
                                      <div className="text-sm text-neutral-400 leading-relaxed">
                                        <ReactMarkdown>
                                          {ensureString(analysis.connections)}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'toc-glossary' && (
                          <motion.div
                            key="toc"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                          >
                            <div className="bg-neutral-900 rounded-[32px] border border-neutral-800 p-8 shadow-xl">
                              <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                  <List className="w-5 h-5 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Table of Contents</h3>
                              </div>
                              <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{ensureString(analysis.toc)}</ReactMarkdown>
                              </div>
                            </div>

                            <div className="bg-neutral-900 rounded-[32px] border border-neutral-800 p-8 shadow-xl">
                              <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Mini Glossary</h3>
                              </div>
                              <div className="space-y-4">
                                {analysis.glossary.map((item, i) => (
                                  <div key={i} className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/50 group hover:border-blue-500/30 transition-all">
                                    <p className="text-sm font-bold text-blue-400 mb-1">{item.term}</p>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{item.definition}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'study' && (
                          <motion.div
                            key="study"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              <div className="lg:col-span-2 space-y-8">
                                <div className="bg-neutral-900 rounded-[32px] border border-neutral-800 p-8 shadow-xl">
                                  <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                      <Brain className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Revision Notes</h3>
                                  </div>
                                  <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{ensureString(analysis.revisionNotes)}</ReactMarkdown>
                                  </div>
                                </div>

                                <div className="bg-neutral-900 rounded-[32px] border border-neutral-800 p-8 shadow-xl">
                                  <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                      <HelpCircle className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Advanced Q&A</h3>
                                  </div>
                                  <div className="space-y-6">
                                    {analysis.advancedQuestions.map((q, i) => (
                                      <div key={i} className="space-y-3">
                                        <p className="text-sm font-bold text-white flex items-start gap-3">
                                          <span className="text-yellow-500 font-mono">Q{i+1}.</span>
                                          {q.question}
                                        </p>
                                        <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/50 text-xs text-neutral-400 leading-relaxed">
                                          <span className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] block mb-2">Answer</span>
                                          {q.answer}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-8">
                                <div className="bg-neutral-900 rounded-[32px] border border-neutral-800 p-8 shadow-xl">
                                  <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                                      <Layers className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Flashcards</h3>
                                  </div>
                                  <div className="space-y-4">
                                    {analysis.flashcards.map((card, i) => (
                                      <div key={i} className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800/50 group cursor-help transition-all hover:bg-neutral-900">
                                        <p className="text-xs font-mono text-neutral-600 uppercase tracking-widest mb-3">Card {i+1}</p>
                                        <p className="text-sm font-bold text-white mb-4">{card.front}</p>
                                        <div className="pt-4 border-t border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <p className="text-xs text-neutral-500 leading-relaxed">{card.back}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'workflows' && (
                          <motion.div
                            key="workflows"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                          >
                            <div className="bg-neutral-900 rounded-[32px] border border-neutral-800 p-8 shadow-xl">
                              <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                  <Workflow className="w-5 h-5 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Step-by-Step Workflows</h3>
                              </div>
                              <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{ensureString(analysis.workflows)}</ReactMarkdown>
                              </div>
                            </div>

                            <div className="bg-neutral-900 rounded-[32px] border border-neutral-800 p-8 shadow-xl">
                              <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Visual & Diagram Suggestions</h3>
                              </div>
                              <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{ensureString(analysis.visuals)}</ReactMarkdown>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'chat' && (
                          <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto flex flex-col h-[700px] bg-neutral-900 rounded-[40px] border border-neutral-800 overflow-hidden shadow-2xl"
                          >
                            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-white">Interactive Q&A Mode</h3>
                                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Strictly based on PDF content</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Context Active</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                              {chat.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                                  <div className="w-20 h-20 bg-neutral-950 rounded-[32px] flex items-center justify-center border border-neutral-800 shadow-xl">
                                    <MessageSquare className="w-10 h-10 text-neutral-800" />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-lg font-bold text-neutral-400">Ask your first question</p>
                                    <p className="text-sm text-neutral-600 max-w-xs mx-auto">I'll provide step-by-step explanations and examples from the document.</p>
                                  </div>
                                  <div className="flex flex-wrap justify-center gap-2">
                                    {["Summarize Section 3", "What are the key formulas?", "Explain the main process"].map((q, i) => (
                                      <button 
                                        key={i}
                                        onClick={() => { setInput(q); }}
                                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-xs rounded-full border border-neutral-700 transition-all"
                                      >
                                        {q}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {chat.map((msg, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={cn(
                                    "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                                    msg.role === 'user' 
                                      ? "bg-emerald-500 text-black ml-auto rounded-tr-none shadow-lg shadow-emerald-500/10" 
                                      : "bg-neutral-800 text-neutral-200 mr-auto rounded-tl-none border border-neutral-700/50"
                                  )}
                                >
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </motion.div>
                              ))}
                              {loading && (
                                <div className="flex items-center gap-3 text-neutral-500 text-xs font-mono uppercase tracking-widest">
                                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                  <span>Tutor is analyzing...</span>
                                </div>
                              )}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-6 bg-neutral-950 border-t border-neutral-800">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={input}
                                  onChange={(e) => setInput(e.target.value)}
                                  placeholder="Type your question here..."
                                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-6 pr-16 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
                                />
                                <button
                                  type="submit"
                                  disabled={!input.trim() || loading}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-black rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                                >
                                  <ArrowRight className="w-5 h-5" />
                                </button>
                              </div>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

              {quiz && (
                <div className="bg-neutral-900 rounded-[40px] border border-neutral-800 p-10 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
                    />
                  </div>

                  {!showResults ? (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Question {currentQuestion + 1} of {quiz.length}</span>
                        <span className="text-xs font-mono text-blue-500 uppercase tracking-widest">Score: {score}</span>
                      </div>

                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {quiz[currentQuestion].question}
                      </h3>

                      <div className="grid grid-cols-1 gap-4">
                        {quiz[currentQuestion].options.map((option, i) => (
                          <button
                            key={i}
                            onClick={() => handleOptionSelect(i)}
                            disabled={isAnswered}
                            className={cn(
                              "p-6 rounded-2xl border text-left transition-all flex items-center justify-between group",
                              selectedOption === i 
                                ? (i === quiz[currentQuestion].correctAnswer ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-red-500/10 border-red-500 text-red-500")
                                : (isAnswered && i === quiz[currentQuestion].correctAnswer ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700")
                            )}
                          >
                            <span className="font-medium">{option}</span>
                            {isAnswered && i === quiz[currentQuestion].correctAnswer && <CheckCircle2 className="w-5 h-5" />}
                            {isAnswered && selectedOption === i && i !== quiz[currentQuestion].correctAnswer && <X className="w-5 h-5" />}
                          </button>
                        ))}
                      </div>

                      {isAnswered && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-800">
                            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-2">Explanation</p>
                            <p className="text-sm text-neutral-300 leading-relaxed">{quiz[currentQuestion].explanation}</p>
                          </div>
                          <button
                            onClick={nextQuestion}
                            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
                          >
                            {currentQuestion + 1 === quiz.length ? "Finish Quiz" : "Next Question"}
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-8 py-10">
                      <div className="w-24 h-24 bg-blue-500/10 rounded-[40px] flex items-center justify-center border border-blue-500/20 mx-auto mb-6">
                        <Trophy className="w-12 h-12 text-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-white">Quiz Completed!</h3>
                        <p className="text-neutral-500">You scored {score} out of {quiz.length}</p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-4">
                        <div className="p-6 bg-neutral-950 rounded-3xl border border-neutral-800 min-w-[120px]">
                          <p className="text-2xl font-bold text-white">{Math.round((score / quiz.length) * 100)}%</p>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Accuracy</p>
                        </div>
                        <div className="p-6 bg-neutral-950 rounded-3xl border border-neutral-800 min-w-[120px]">
                          <p className="text-2xl font-bold text-white">{score}</p>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Correct</p>
                        </div>
                      </div>

                      <div className="flex gap-4 max-w-md mx-auto">
                        <button
                          onClick={handleGenerateQuiz}
                          className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-400 transition-all"
                        >
                          Retake Quiz
                        </button>
                        <button
                          onClick={() => setQuiz(null)}
                          className="flex-1 py-4 bg-neutral-800 text-white rounded-2xl font-bold hover:bg-neutral-700 transition-all"
                        >
                          Back to Analysis
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};