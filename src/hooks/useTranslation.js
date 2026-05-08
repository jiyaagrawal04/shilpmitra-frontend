import { useState, useCallback } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import kn from '../i18n/kn.json';

const langs = { en, hi, kn };
const STORAGE_KEY = 'shilpmitra_lang';

export function useTranslation() {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'en'
  );

  const t = useCallback((key) => {
    const keys = key.split('.');
    let val = langs[lang];
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) return key;
    }
    return val || key;
  }, [lang]);

  const setLanguage = useCallback((l) => {
    if (!['en', 'hi', 'kn'].includes(l)) l = 'en';
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
    document.documentElement.lang = l === 'hi' ? 'hi' : l === 'kn' ? 'kn' : 'en';
  }, []);

  const langName = { en: 'English', hi: 'Hindi', kn: 'Kannada' }[lang] || 'English';

  return { t, lang, setLanguage, langName };
}
