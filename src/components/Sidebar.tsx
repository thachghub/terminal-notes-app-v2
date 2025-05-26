'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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

  // Helper to convert hex + opacity to rgba
  function hexToRgba(hex: string, alpha: number = 1) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const textColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#22d3ee';
  const backgroundColor = bgColor ? hexToRgba(bgColor, bgOpacity) : '#0f2124';
  const borderColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#06b6d4';

  // Helper to darken a hex color
  function darkenHex(hex: string, percent: number) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.floor(r * (1 - percent));
    g = Math.floor(g * (1 - percent));
    b = Math.floor(b * (1 - percent));
    return `rgba(${r},${g},${b},${bgOpacity ?? 1})`;
  }
  const gradientStart = backgroundColor;
  const gradientEnd = bgColor ? darkenHex(bgColor, 0.18) : '#0a1417';

  return (
    <motion.div
      className="relative border-r"
      style={{ width: isCollapsed ? '1.92rem' : '12rem', background: `linear-gradient(180deg, ${gradientStart} 0%, ${gradientEnd} 100%)`, borderColor }}
      initial={{ width: '12rem' }}
      animate={{ width: isCollapsed ? '1.92rem' : '12rem' }}
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
            className="flex flex-col"
          >
            <nav className="flex flex-col space-y-3 p-8 pt-16 text-lg">
              <a href="/" style={{ color: textColor }}
                className="relative py-2 px-4 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block">
                Dashboard
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#" style={{ color: textColor }}
                className="relative py-2 px-4 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block">
                List
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#" style={{ color: textColor }}
                className="relative py-2 px-4 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block">
                Dates
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#" style={{ color: textColor }}
                className="relative py-2 px-4 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block">
                Timer
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/settings" style={{ color: textColor }}
                className="relative py-2 px-4 my-1 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer group block">
                Settings
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
