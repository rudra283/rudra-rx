export type TabId = 'home' | 'chat' | 'voice' | 'image-gen' | 'video-gen' | 'document-assistant' | 'video-analysis' | 'audio-gen' | 'audio-transcribe' | 'history' | 'admin' | 'settings';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  type?: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  data?: any;
}

export interface HistoryItem {
  id: string;
  type: TabId;
  title: string;
  timestamp: number;
  data: any;
}
