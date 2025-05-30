// src/components/TopNav.tsx
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { hexToRgba, darkenHex } from '@/lib/colorUtils';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function TopNav({ fontColor, fontOpacity, bgColor, bgOpacity }: {
  fontColor?: string;
  fontOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const textColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#22d3ee';
  const backgroundColor = bgColor ? hexToRgba(bgColor, bgOpacity) : '#0f2124';
  const borderColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#06b6d4';

  const gradientStart = backgroundColor;
  const gradientEnd = bgColor ? darkenHex(bgColor, 0.18) : '#0a1417';

  const handleAuthClick = () => {
    router.push('/auth');
  };

  const handleLogEntryClick = () => {
    router.push('/entryterminal');
  };

  const handleDeepEntryClick = () => {
    router.push('/deepterminal');
  };

  const logEntryText = t('logEntry').replace(/^\s*>/, '').trim();
  const signInText = t('signIn').replace(/^\s*>/, '').trim();

  return (
    <header aria-label="Top Navigation Bar">
      <div
        className="flex items-start space-x-2 min-h-[3.5rem] py-2"
      >
        {/* Nav Buttons - New Order: Log Entry, Deep Entry, Sign In */}
        <button 
          onClick={handleLogEntryClick}
          style={{ borderColor }} 
          className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]" 
          aria-label={logEntryText}
        >
          {`> ${logEntryText}`}
        </button>
        <button 
          onClick={handleDeepEntryClick}
          style={{ borderColor }}
          className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]" 
          aria-label={"Deep Entry" /* TODO: Replace with t('deepEntry') after adding to en.json */}
        >
          {/* TODO: Replace with t('deepEntry') after adding to en.json */}
          {`> ${("Deep Entry")}`}
        </button>
        <button 
          onClick={handleAuthClick}
          style={{ borderColor }} 
          className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]" 
          aria-label={signInText}
        >
          {`> ${signInText}`}
        </button>
      </div>
    </header>
  );
}