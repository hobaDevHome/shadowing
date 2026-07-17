export interface Subtitle {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export type VisibilityMode = 'show' | 'hide' | 'blur';

export type FontSizeMode = 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export type PauseDurationMode = 0.5 | 1 | 2 | 3; // in seconds

export interface AppSettings {
  playbackSpeed: number;
  pauseDuration: PauseDurationMode;
  autoNext: boolean;
  autoScroll: boolean;
  darkMode: boolean;
  fontSize: FontSizeMode;
}

export interface PracticeStats {
  practicedIds: number[]; // Store practiced subtitle IDs
  repeatCounts: Record<number, number>; // id -> repeat count
  totalPracticeTime: number; // in seconds
}
