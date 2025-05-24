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

  return (
    <motion.div
      className="relative border-r"
      style={{ width: isCollapsed ? '3rem' : '12rem', backgroundColor, borderColor }}
      initial={{ width: '12rem' }}
      animate={{ width: isCollapsed ? '3rem' : '12rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-2 left-1/2 -translate-x-1/2 text-4xl font-bold text-cyan-300 hover:text-white cursor-pointer transition-colors duration-300"
      >
        {isCollapsed ? '<' : '>'}
      </button>

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
              <a href="/" style={{ color: textColor }} className="hover:text-white cursor-pointer py-1">
                Dashboard
              </a>
              <a href="#" style={{ color: textColor }} className="hover:text-white cursor-pointer py-1">
                Notes
              </a>
              <a href="#" style={{ color: textColor }} className="hover:text-white cursor-pointer py-1">
                Tags
              </a>
              <a href="#" style={{ color: textColor }} className="hover:text-white cursor-pointer py-1">
                Settings
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
