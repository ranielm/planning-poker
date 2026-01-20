import { useState, useEffect, ReactNode } from 'react';
import { I18nContext, Language, translations } from './index';

const STORAGE_KEY = 'planning-poker-language';

function getInitialLanguage(): Language {
  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en-US' || stored === 'pt-BR') {
    return stored;
  }

  // Check browser language - IGNORED as per requirements, default is always en-US
  // const browserLang = navigator.language;
  // if (browserLang.startsWith('pt')) {
  //   return 'pt-BR';
  // }

  return 'en-US';
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // Update document lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}
