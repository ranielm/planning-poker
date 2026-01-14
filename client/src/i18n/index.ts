import { createContext, useContext } from 'react';
import { enUS, Translations } from './en-US';
import { ptBR } from './pt-BR';

export type Language = 'en-US' | 'pt-BR';

export const translations: Record<Language, Translations> = {
  'en-US': enUS,
  'pt-BR': ptBR,
};

export const languageNames: Record<Language, string> = {
  'en-US': 'English',
  'pt-BR': 'Português (BR)',
};

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export { enUS, ptBR };
export type { Translations };
