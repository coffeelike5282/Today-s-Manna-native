export type ScreenState = 'START' | 'VERSE' | 'DETAIL';

export type Language = 'ko' | 'en';

export interface MannaData {
  verseRef: string;
  verseText: string;
  fullVerse: string;
  interpretation: string;
  mission: string;
  date: string; // YYYY-MM-DD

  // English fields
  verseRefEn?: string;
  verseTextEn?: string;
  fullVerseEn?: string;
  interpretationEn?: string;
  missionEn?: string;
  source?: 'DB' | 'Offline';
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

export interface ScreenProps {
  onNext: (date?: string) => void;
  onBack?: () => void;
  data: MannaData;
  isMuted?: boolean;
  toggleMute?: () => void;
  language?: Language;
  toggleLanguage?: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  user?: User | null;
  version?: string;
}
