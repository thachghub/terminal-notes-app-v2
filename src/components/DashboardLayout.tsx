// src/components/DashboardLayout.tsx

import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import TerminalDisplay from "./TerminalDisplay";
import { useState } from "react";
import { hexToRgba, darkenHex } from '@/lib/colorUtils';
import GlobalOverlay from './ui/GlobalOverlay';

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

  // Always use full opacity for TopNav background to avoid black bar
  const topNavBackground = topNavBg ? hexToRgba(topNavBg, 1) : '#0f2124';
  const gradientStart = topNavBackground;
  // Always use full opacity for gradient end as well
  const gradientEnd = topNavBg ? darkenHex(topNavBg, 0.18) : '#0a1417';

  return (
    <div className="flex h-screen text-[#fff] font-mono min-h-screen">
      <GlobalOverlay />
      {/* Left Navigation Frame */}
      <Sidebar
        fontColor={fontColor}
        fontOpacity={fontOpacity}
        bgColor={topNavBg}
        bgOpacity={topNavBgOpacity}
      />
      {/* Right Frame */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Outer container for the entire Top Navigation area */}
        <motion.div
          className="w-full overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
          }}
          animate={{
            maxHeight: isCollapsed ? '2.5rem' : '999px',
            paddingTop: 0,
            paddingBottom: 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="relative flex items-start min-h-[3.5rem] px-4">
            <NavToggle 
              isCollapsed={isCollapsed} 
              onToggle={() => setIsCollapsed(!isCollapsed)} 
            />
            {!isCollapsed && (
              <div className="flex items-start space-x-2 pl-12">
                <TopNav fontColor={fontColor} fontOpacity={fontOpacity} />
              </div>
            )}
          </div>
          <div className="w-full border-b border-cyan-500" style={{height: 2}} />
        </motion.div>

        {/* Main Content Section */}
        <div className="flex-1 overflow-auto h-full" style={{ background: `linear-gradient(90deg, ${gradientStart} 0%, ${gradientEnd} 100%)` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
