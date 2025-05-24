'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      className="relative bg-[#0f2124] border-r border-cyan-500"
      style={{ width: isCollapsed ? '3rem' : '12rem' }}
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
              <a href="#" className="text-cyan-300 hover:text-white cursor-pointer py-1">
                Dashboard
              </a>
              <a href="#" className="text-cyan-300 hover:text-white cursor-pointer py-1">
                Notes
              </a>
              <a href="#" className="text-cyan-300 hover:text-white cursor-pointer py-1">
                Tags
              </a>
              <a href="#" className="text-cyan-300 hover:text-white cursor-pointer py-1">
                Settings
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
