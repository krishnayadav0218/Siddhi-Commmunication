import { createContext, useContext, useEffect, useState } from 'react';
import { translate } from './i18n';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'siddhi_lang';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi') setLang(saved);
    } catch (e) {
      // ignore
    }
  }, []);

  function changeLang(next) {
    setLang(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // ignore
    }
  }

  const t = (key) => translate(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
