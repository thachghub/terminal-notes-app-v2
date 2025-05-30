'use client';
import { usePreferencesStore } from '@/store/preferencesStore';
import { supportedLanguages, Language } from '@/lib/translations';
import { useTranslation } from '@/hooks/useTranslation';

export default function LanguageSelectorSettings() {
  const language = usePreferencesStore(s => s.language);
  const setLanguage = usePreferencesStore(s => s.setLanguage);
  const { t } = useTranslation();

  return (
    <div>
      <label htmlFor="language-selector" className="text-cyan-300 font-mono text-xs uppercase">
        {t('language')}
      </label>
      <select
        id="language-selector"
        value={language}
        onChange={e => setLanguage(e.target.value as Language)}
        className="ml-2 p-1 rounded bg-neutral-700 text-white font-mono text-sm"
      >
        {supportedLanguages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
} 