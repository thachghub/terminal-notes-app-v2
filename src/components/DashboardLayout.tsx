// src/components/DashboardLayout.tsx

import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import TerminalDisplay from "./TerminalDisplay";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  fontColor: string;
  fontOpacity: number;
  topNavBg: string;
  topNavBgOpacity: number;
  sidebarBg: string;
  sidebarBgOpacity: number;
  terminalBg: string;
  terminalBgOpacity: number;
}

import { motion, AnimatePresence } from 'framer-motion';

import NavToggle from './NavToggle';

export default function DashboardLayout({
  children,
  fontColor,
  fontOpacity,
  topNavBg,
  topNavBgOpacity,
  sidebarBg,
  sidebarBgOpacity,
  terminalBg,
  terminalBgOpacity
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Helper to convert hex + opacity to rgba
  function hexToRgba(hex: string, alpha: number = 1) {
    if (!hex || hex[0] !== '#' || hex.length !== 7) return '#0f2124';
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const topNavBackground = topNavBg ? hexToRgba(topNavBg, topNavBgOpacity ?? 1) : '#0f2124';
  // Helper to darken a hex color
  function darkenHex(hex: string, percent: number) {
    if (!hex || hex[0] !== '#' || hex.length !== 7) return '#0f2124';
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.floor(r * (1 - percent));
    g = Math.floor(g * (1 - percent));
    b = Math.floor(b * (1 - percent));
    return `rgba(${r},${g},${b},${topNavBgOpacity ?? 1})`;
  }
  const gradientStart = topNavBackground;
  const gradientEnd = topNavBg ? darkenHex(topNavBg, 0.18) : '#0a1417';

  return (
    <div className="flex h-screen text-[#fff] font-mono">
      {/* Left Navigation Frame */}
      <Sidebar
        fontColor={fontColor}
        fontOpacity={fontOpacity}
        bgColor={topNavBg}
        bgOpacity={topNavBgOpacity}
      />
      {/* Right Frame */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "none" }}>
        {/* Outer container for the entire Top Navigation area */}
        <motion.div 
          className="px-4 border-b border-cyan-500 relative" 
          style={{ 
            background: `linear-gradient(90deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
            overflow: 'hidden' 
          }}
          initial={{
            height: '3rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
          }}
          animate={{
            height: isCollapsed ? '1rem' : '3rem', // Collapsed height for shrunken toggle + border
            paddingTop: '0.5rem', // Keep paddingTop for NavToggle positioning
            paddingBottom: isCollapsed ? '0px' : '0.5rem', // No bottom padding when collapsed
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <NavToggle 
            isCollapsed={isCollapsed} 
            onToggle={() => setIsCollapsed(!isCollapsed)} 
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: '2rem', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                transition={{ duration: 0.3 }}
                className="pl-12" 
                style={{ overflow: 'hidden' }} 
              >
                <TopNav
                  fontColor={fontColor}
                  fontOpacity={fontOpacity}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Content Section */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
