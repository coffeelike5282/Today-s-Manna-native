export enum ScreenState {
  START = 'START',
  VERSE = 'VERSE',
  DETAIL = 'DETAIL',
}

export type Language = 'ko' | 'en';

export interface MannaData {
  verseRef: string;
  verseText: string;
  fullVerse: string;
  interpretation: string;
  mission: string;

  // English fields
  verseRefEn?: string;
  verseTextEn?: string;
  fullVerseEn?: string;
  interpretationEn?: string;
  missionEn?: string;
}

export interface ScreenProps {
  onNext: () => void;
  onBack?: () => void;
  data: MannaData;
  isMuted?: boolean;
  toggleMute?: () => void;
  language?: Language;
  toggleLanguage?: () => void; // Optional, defaults to no-op in components
}
