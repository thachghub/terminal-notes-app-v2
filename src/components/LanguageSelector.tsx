'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferencesStore } from '@/store/preferencesStore';
import { supportedLanguages, Language, t } from '@/lib/translations';

interface LanguageSelectorProps {
  fontColor?: string;
  fontOpacity?: number;
}

export default function LanguageSelector({ fontColor, fontOpacity }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const language = usePreferencesStore(s => s.language);
  const setLanguage = usePreferencesStore(s => s.setLanguage);

  const textColor = fontColor ? `rgba(${parseInt(fontColor.slice(1, 3), 16)}, ${parseInt(fontColor.slice(3, 5), 16)}, ${parseInt(fontColor.slice(5, 7), 16)}, ${fontOpacity || 1})` : '#22d3ee';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  const currentLanguage = supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 px-2 text-xs text-center transition-colors duration-200 hover:bg-cyan-400/10 relative group"
        style={{ color: textColor }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={t('language', language as Language)}
      >
        <div className="flex items-center justify-center space-x-1">
          <span className="text-sm">🌐</span>
          <span className="font-mono text-xs">{currentLanguage.code.toUpperCase()}</span>
        </div>
        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-48 bg-black/95 border border-cyan-400 rounded shadow-lg shadow-cyan-400/20 z-50 backdrop-blur-sm"
          >
            <div className="p-2">
              <div className="text-cyan-400 text-xs font-mono mb-2 text-center border-b border-cyan-400/30 pb-2">
                {t('language', language as Language)}
              </div>
              <div className="space-y-1">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-2 py-1 text-xs font-mono transition-colors duration-150 rounded hover:bg-cyan-400/20 ${
                      language === lang.code 
                        ? 'bg-cyan-400/30 text-cyan-300' 
                        : 'text-gray-300 hover:text-cyan-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{lang.nativeName}</span>
                      <span className="text-xs opacity-60">{lang.code.toUpperCase()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 