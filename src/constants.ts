import { TabId } from './types';
import { 
  Home,
  MessageSquare, 
  Mic, 
  Video, 
  FileVideo, 
  Volume2, 
  FileAudio, 
  History,
  FileText,
  Image as ImageIcon,
  Shield,
  Settings
} from 'lucide-react';

export const TABS = [
  { id: 'home' as TabId, label: 'Home', icon: Home, description: 'Overview & Features' },
  { id: 'chat' as TabId, label: 'AI Chat', icon: MessageSquare, description: 'Fast & Smart Q&A' },
  { id: 'voice' as TabId, label: 'Voice Assistant', icon: Mic, description: 'Real-time Voice Chat' },
  { id: 'image-gen' as TabId, label: 'Image Studio', icon: ImageIcon, description: 'Text to Image' },
  { id: 'video-gen' as TabId, label: 'Video Creator', icon: Video, description: 'Text to Video (Veo)' },
  { id: 'document-assistant' as TabId, label: 'Doc Assistant', icon: FileText, description: 'Analyze & Summarize PDFs' },
  { id: 'video-analysis' as TabId, label: 'Video Insights', icon: FileVideo, description: 'Analyze & Summarize' },
  { id: 'audio-gen' as TabId, label: 'Speech Synth', icon: Volume2, description: 'Text to Speech' },
  { id: 'audio-transcribe' as TabId, label: 'Transcriber', icon: FileAudio, description: 'Speech to Text' },
  { id: 'history' as TabId, label: 'History', icon: History, description: 'Your Creations' },
  { id: 'settings' as TabId, label: 'Settings', icon: Settings, description: 'Preferences' },
  { id: 'admin' as TabId, label: 'Admin', icon: Shield, description: 'System Control' },
];

export const MODELS = {
  FAST: 'gemini-3.1-flash-lite-preview',
  PRO: 'gemini-3.1-pro-preview',
  FLASH: 'gemini-3-flash-preview',
  IMAGE_FREE: 'gemini-2.5-flash-image',
  IMAGE_FLASH: 'gemini-3.1-flash-image-preview',
  IMAGE_PRO: 'gemini-3-pro-image-preview',
  VEO: 'veo-3.1-generate-preview',
  VEO_FAST: 'veo-3.1-fast-generate-preview',
  TTS: 'gemini-2.5-flash-preview-tts',
  LIVE: 'gemini-2.5-flash-native-audio-preview-09-2025',
  // External Video Models (via Fal.ai or similar)
  SORA_2: 'openai/sora-2',
  SORA_2_PRO: 'openai/sora-2-pro',
  WAN_2_6: 'wan/wan-2.6',
  SEEDANCE_1_5_PRO: 'seedance/seedance-1.5-pro',
  KLING_2_5_TURBO: 'kling/kling-2.5-turbo',
  MINIMAX_2_3: 'minimax/hailuo-2.3',
  KLING_O1_PRO: 'kling/kling-o1-pro',
  KLING_O1_STD: 'kling/kling-o1-std',
  // OpenRouter Models
  OR_GPT_4O: 'openai/gpt-4o',
  OR_CLAUDE_3_5_SONNET: 'anthropic/claude-3.5-sonnet',
  OR_DEEPSEEK_V3: 'deepseek/deepseek-chat',
  OR_LLAMA_3_1_405B: 'meta-llama/llama-3.1-405b-instruct',
  OR_MISTRAL_LARGE: 'mistralai/mistral-large',
  OR_QWEN_2_5_72B: 'qwen/qwen-2.5-72b-instruct',
};

export const OPENROUTER_MODELS_LIST = [
  { id: MODELS.OR_GPT_4O, name: 'GPT-4o', provider: 'OpenAI' },
  { id: MODELS.OR_CLAUDE_3_5_SONNET, name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: MODELS.OR_DEEPSEEK_V3, name: 'DeepSeek V3', provider: 'DeepSeek' },
  { id: MODELS.OR_LLAMA_3_1_405B, name: 'Llama 3.1 405B', provider: 'Meta' },
  { id: MODELS.OR_MISTRAL_LARGE, name: 'Mistral Large', provider: 'Mistral' },
  { id: MODELS.OR_QWEN_2_5_72B, name: 'Qwen 2.5 72B', provider: 'Alibaba' },
];

export const VIDEO_MODELS_LIST = [
  { id: MODELS.VEO_FAST, name: 'VEO 3.1 Fast', provider: 'Google', res: ['720p', '1080p'], tier: 'Free' },
  { id: MODELS.VEO, name: 'VEO 3.1 Pro', provider: 'Google', res: ['720p', '1080p'], tier: 'Pro' },
  { id: MODELS.SORA_2, name: 'Sora 2', provider: 'OpenAI', res: ['720p', '1080p'], tier: 'Pro' },
  { id: MODELS.SORA_2_PRO, name: 'Sora 2 Pro', provider: 'OpenAI', res: ['1080p', '4K'], tier: 'Enterprise' },
  { id: MODELS.WAN_2_6, name: 'WAN 2.6', provider: 'Wan', res: ['720p', '1080p'], tier: 'Pro' },
  { id: MODELS.SEEDANCE_1_5_PRO, name: 'Seedance 1.5 Pro', provider: 'Seedance', res: ['1080p'], tier: 'Pro' },
  { id: MODELS.KLING_2_5_TURBO, name: 'Kling 2.5 Turbo', provider: 'Kling', res: ['720p', '1080p'], tier: 'Pro' },
  { id: MODELS.MINIMAX_2_3, name: 'Minimax Hailuo 2.3', provider: 'Minimax', res: ['1080p'], tier: 'Pro' },
  { id: MODELS.KLING_O1_PRO, name: 'Kling Video O1 Pro', provider: 'Kling', res: ['1080p', '4K'], tier: 'Enterprise' },
  { id: MODELS.KLING_O1_STD, name: 'Kling Video O1 Std', provider: 'Kling', res: ['1080p'], tier: 'Pro' },
];
