'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { hexToRgba, darkenHex } from '@/lib/colorUtils';

export default function Sidebar({ fontColor, fontOpacity, bgColor, bgOpacity }: {
  fontColor?: string;
  fontOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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
            <nav className="flex flex-col space-y-3 pt-16 text-lg w-full items-center">
              <a href="/" style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full">
                Dashboard
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#" style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full">
                List
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#" style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full">
                Dates
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#" style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full">
                Timer
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/settings" style={{ color: textColor }}
                className="relative py-2 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block text-center w-full">
                Settings
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer only visible when expanded */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 w-full pb-2 text-xs text-center">
          <div className="text-cyan-300">&copy; HYPERSKYE LLC</div>
          <div className="text-cyan-500 opacity-80">Developed <span className="text-yellow-400">2025</span></div>
        </div>
      )}
    </motion.div>
  );
}
