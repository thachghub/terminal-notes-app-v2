'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { useRouter } from 'next/navigation';
import { hexToRgba, darkenHex } from '@/lib/colorUtils';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';

export default function Sidebar({ fontColor, fontOpacity, bgColor, bgOpacity }: {
  fontColor?: string;
  fontOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user && user.emailVerified) {
      router.push('/userdashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const textColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#22d3ee';
  const backgroundColor = bgColor ? hexToRgba(bgColor, bgOpacity) : '#0f2124';
  const borderColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#06b6d4';

  const gradientStart = backgroundColor;
  const gradientEnd = bgColor ? darkenHex(bgColor, 0.18) : '#0a1417';

  return (
    <motion.div
      className="relative border-r"
      style={{ width: isCollapsed ? '1.54rem' : '9.6rem', background: `linear-gradient(180deg, ${gradientStart} 0%, ${gradientEnd} 100%)`, borderColor }}
      initial={{ width: '9.6rem' }}
      animate={{ width: isCollapsed ? '1.54rem' : '9.6rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Toggle Button */}
      <motion.button
        onClick={toggleSidebar}
        className="absolute top-2 left-1/2 -translate-x-1/2 text-4xl font-bold text-cyan-300 hover:text-yellow-500 cursor-pointer transition-colors duration-300"
        initial={{
          opacity: 0,
          y: -30,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isCollapsed ? 0.5 : 1,
          rotate: isCollapsed ? 180 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        &gt;
      </motion.button>

      {/* Collapsible Sidebar Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <nav className="flex flex-col space-y-3 pt-16 text-lg w-full items-center" aria-label="Main Sidebar">
              <a href="#" onClick={handleDashboardClick} style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full"
                aria-label={t('dashboard')}
              >
                {t('dashboard')}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              {/* TODO: Replace with real route when implemented */}
              <a href="#" onClick={e => e.preventDefault()} style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full"
                aria-label={`${t('list')} (coming soon)`}
              >
                {t('list')}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              {/* TODO: Replace with real route when implemented */}
              <a href="#" onClick={e => e.preventDefault()} style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full"
                aria-label={`${t('dates')} (coming soon)`}
              >
                {t('dates')}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              {/* TODO: Replace with real route when implemented */}
              <a href="#" onClick={e => e.preventDefault()} style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full"
                aria-label={`${t('timer')} (coming soon)`}
              >
                {t('timer')}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/settings" style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full"
                aria-label={t('settings')}
              >
                {t('settings')}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              
              {/* Language Selector */}
              <div className="w-full px-2 mt-2">
                <LanguageSelector 
                  fontColor={fontColor} 
                  fontOpacity={fontOpacity}
                />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer only visible when expanded */}
      {!isCollapsed && (
        <footer className="absolute bottom-0 left-0 w-full pb-2 text-xs text-center" aria-label="Sidebar Footer">
          <div className="text-cyan-300">&copy; HYPERSKYE LLC</div>
          <div className="text-cyan-500 opacity-80">Developed <span className="text-yellow-400">2025</span></div>
        </footer>
      )}
    </motion.div>
  );
}
