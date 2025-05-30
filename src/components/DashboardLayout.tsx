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
          className="w-full overflow-hidden relative"
          style={{
            background: `linear-gradient(90deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
          }}
          animate={{
            maxHeight: isCollapsed ? '2.5rem' : '999px',
            paddingTop: 0,
            paddingBottom: 0
          }}
          transition={{ 
            duration: 0.78,
            ease: 'easeInOut',
            onStart: () => {
              // Trigger glitch effect during transition
            }
          }}
        >
          {/* Cyber Glitch Effects Layer */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isCollapsed ? [0, 1, 0.7, 0] : [0, 0.8, 0.5, 0],
            }}
            transition={{
              duration: 0.78,
              times: [0, 0.2, 0.5, 1],
              ease: "easeInOut"
            }}
          >
            {/* RGB Separation Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-blue-500/20"
              animate={{
                x: isCollapsed ? [0, -2, 1, 0] : [0, 2, -1, 0],
                scaleY: isCollapsed ? [1, 1.02, 0.98, 1] : [1, 0.98, 1.02, 1]
              }}
              transition={{
                duration: 0.78,
                times: [0, 0.3, 0.7, 1]
              }}
            />
            
            {/* Digital Scan Lines */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(34, 211, 238, 0.1) 1px, rgba(34, 211, 238, 0.1) 2px)',
              }}
              animate={{
                opacity: isCollapsed ? [0, 0.8, 0.3, 0] : [0, 0.6, 0.2, 0],
                y: isCollapsed ? [0, -10, 5, 0] : [0, 10, -5, 0]
              }}
              transition={{
                duration: 0.78,
                times: [0, 0.4, 0.8, 1]
              }}
            />

            {/* Static Noise Effect */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: `
                  radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
                `
              }}
              animate={{
                scale: isCollapsed ? [1, 1.1, 0.9, 1] : [1, 0.9, 1.1, 1],
                rotate: isCollapsed ? [0, 1, -0.5, 0] : [0, -1, 0.5, 0],
                opacity: [0, 0.4, 0.2, 0]
              }}
              transition={{
                duration: 0.78,
                times: [0, 0.3, 0.7, 1]
              }}
            />

            {/* Glitch Bars */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-cyan-400/60"
                style={{
                  height: '2px',
                  width: '100%',
                  top: `${20 + i * 30}%`,
                }}
                animate={{
                  x: isCollapsed ? 
                    [0, -100, 50, -200, 0] : 
                    [0, 100, -50, 200, 0],
                  opacity: [0, 0.8, 0.4, 0.9, 0],
                  scaleX: [0, 1.5, 0.5, 1.2, 0]
                }}
                transition={{
                  duration: 0.78,
                  times: [0, 0.2, 0.4, 0.7, 1],
                  delay: i * 0.13
                }}
              />
            ))}

            {/* Digital Distortion Lines */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: isCollapsed ? [
                  'linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.2) 50%, transparent 100%)',
                  'linear-gradient(90deg, rgba(34, 211, 238, 0.1) 0%, transparent 20%, rgba(34, 211, 238, 0.3) 80%, transparent 100%)',
                  'linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%)',
                ] : [
                  'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.2) 50%, transparent 100%)',
                  'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 30%, rgba(16, 185, 129, 0.3) 70%, transparent 100%)',
                  'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.1) 50%, transparent 100%)',
                ]
              }}
              transition={{
                duration: 0.78,
                times: [0, 0.5, 1]
              }}
            />
          </motion.div>

          {/* Main Content with Enhanced Effects */}
          <motion.div 
            className="relative flex items-start min-h-[3.5rem] px-4 z-20"
            animate={{
              filter: isCollapsed ? 
                ['blur(0px)', 'blur(0.5px)', 'blur(0px)'] : 
                ['blur(0px)', 'blur(0.3px)', 'blur(0px)'],
              y: isCollapsed ? [0, -1, 0.5, 0] : [0, 1, -0.5, 0]
            }}
            transition={{
              duration: 0.78,
              times: [0, 0.3, 0.7, 1]
            }}
          >
            <NavToggle 
              isCollapsed={isCollapsed} 
              onToggle={() => setIsCollapsed(!isCollapsed)} 
            />
            {!isCollapsed && (
              <motion.div 
                className="flex items-start space-x-2 pl-12"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ 
                  duration: 0.52,
                  delay: 0.26,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <TopNav fontColor={fontColor} fontOpacity={fontOpacity} />
              </motion.div>
            )}
          </motion.div>
          
          {/* Enhanced Border with Glitch */}
          <motion.div 
            className="w-full border-b border-cyan-500 relative" 
            style={{height: 2}}
            animate={{
              borderColor: isCollapsed ? 
                ['#06b6d4', '#22d3ee', '#10b981', '#06b6d4'] :
                ['#06b6d4', '#10b981', '#22d3ee', '#06b6d4'],
              boxShadow: isCollapsed ?
                ['0 0 0px rgba(34, 211, 238, 0)', '0 0 10px rgba(34, 211, 238, 0.5)', '0 0 0px rgba(34, 211, 238, 0)'] :
                ['0 0 0px rgba(16, 185, 129, 0)', '0 0 8px rgba(16, 185, 129, 0.4)', '0 0 0px rgba(16, 185, 129, 0)']
            }}
            transition={{
              duration: 0.78,
              times: [0, 0.5, 1]
            }}
          />
        </motion.div>

        {/* Main Content Section */}
        <div className="flex-1 overflow-auto h-full" style={{ background: `linear-gradient(90deg, ${gradientStart} 0%, ${gradientEnd} 100%)` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
