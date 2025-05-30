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
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('top');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const language = usePreferencesStore(s => s.language);
  const setLanguage = usePreferencesStore(s => s.setLanguage);

  const textColor = fontColor ? `rgba(${parseInt(fontColor.slice(1, 3), 16)}, ${parseInt(fontColor.slice(3, 5), 16)}, ${parseInt(fontColor.slice(5, 7), 16)}, ${fontOpacity || 1})` : '#22d3ee';

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 300; // Max height we'll set for the dropdown

    // Space available above and below the button
    const spaceAbove = buttonRect.top;
    const spaceBelow = viewportHeight - buttonRect.bottom;

    // If there's more space above or if there's not enough space below, show above
    if (spaceAbove > spaceBelow && spaceBelow < dropdownHeight) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      calculateDropdownPosition();
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
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 px-2 text-xs text-center transition-all duration-300 hover:bg-cyan-400/10 hover:shadow-lg hover:shadow-cyan-400/20 relative group rounded-md border border-transparent hover:border-cyan-400/30"
        style={{ color: textColor }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={t('language', language as Language)}
      >
        <div className="flex items-center justify-center space-x-1">
          <span className="text-sm">🌐</span>
          <span className="font-mono text-xs font-bold">{currentLanguage.code.toUpperCase()}</span>
        </div>
        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-300 group-hover:w-full"></span>
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropdownPosition === 'top' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownPosition === 'top' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${
              dropdownPosition === 'top' 
                ? 'bottom-full mb-2' 
                : 'top-full mt-2'
            } left-0 w-64 bg-gray-900/98 border border-cyan-400/60 rounded-lg shadow-xl shadow-cyan-400/30 z-50 backdrop-blur-md`}
            style={{
              maxHeight: '300px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
            }}
          >
            <div className="p-3">
              <div className="text-cyan-300 text-sm font-mono mb-3 text-center border-b border-cyan-400/40 pb-2">
                <span className="text-cyan-400">▪</span> {t('language', language as Language)} <span className="text-cyan-400">▪</span>
              </div>
              
              {/* Scrollable language list */}
              <div 
                className="space-y-1 overflow-y-auto scrollbar-terminal"
                style={{
                  maxHeight: '220px', // Leave space for header and footer
                }}
              >
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-3 py-2 text-sm font-mono transition-all duration-200 rounded-md hover:bg-cyan-400/15 hover:border-cyan-400/30 border ${
                      language === lang.code 
                        ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/60 shadow-lg shadow-cyan-400/20' 
                        : 'text-gray-300 hover:text-cyan-300 border-transparent hover:shadow-md hover:shadow-cyan-400/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{lang.nativeName}</span>
                      <span className={`text-xs ml-2 flex-shrink-0 font-bold ${
                        language === lang.code ? 'text-cyan-300' : 'text-gray-500'
                      }`}>
                        {lang.code.toUpperCase()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Scroll hint */}
              <div className="text-xs text-gray-400 text-center mt-3 pt-2 border-t border-cyan-400/30">
                <span className="opacity-70">
                  <span className="text-cyan-400">↕</span> Scroll • <span className="text-cyan-400">{supportedLanguages.length}</span> languages
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 