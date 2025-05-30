'use client';
import { usePreferencesStore } from '@/store/preferencesStore';
import { t, TranslationKey, Language } from '@/lib/translations';

export function useTranslation() {
  const language = usePreferencesStore(s => s.language) as Language;
  
  return {
    t: (key: TranslationKey, variables?: Record<string, string>) => t(key, language, variables),
    language,
  };
} 