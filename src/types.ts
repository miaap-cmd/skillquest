export type ComplexityLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface ColorUnit {
  hex: string;
  name: string;
  psychology: string;
  usage: string;
}

export interface StudyTopic {
  id: string;
  name: string;
  summary: string;
  completed: boolean;
  xpReward: number;
}

export interface RoadmapFocus {
  primary: string[];
  secondary: string[];
  advanced: string[];
}

export interface StudyPathway {
  id: string;
  materialId: string;
  materialName: string;
  complexity: ComplexityLevel;
  justifiedPedagogy: string;
  estimatedTime: string;
  colors: ColorUnit[];
  topics: StudyTopic[];
  roadmap: RoadmapFocus;
  category: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
  category: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
}

export interface LibraryMaterial {
  id: string;
  name: string;
  mimeType: string;
  base64Data: string;
  date: string;
  category: string;
  pathwayCreated: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
}
