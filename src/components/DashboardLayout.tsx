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
  // Helper to convert hex + opacity to rgba
  function hexToRgba(hex: string, alpha: number = 1) {
    if (!hex || hex[0] !== '#' || hex.length !== 7) return '#0f2124';
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const topNavBackground = topNavBg ? hexToRgba(topNavBg, topNavBgOpacity ?? 1) : '#0f2124';
  return (
    <div className="flex h-screen text-[#fff] font-mono">
      {/* Left Navigation Frame */}
      <Sidebar
        fontColor={fontColor}
        fontOpacity={fontOpacity}
        bgColor={sidebarBg}
        bgOpacity={sidebarBgOpacity}
      />
      {/* Right Frame */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "none" }}>
        {/* Top Navigation Frame */}
        <div
          className="h-14 px-4 py-2 border-b border-cyan-500"
          style={{ background: topNavBackground }}
        >
          <TopNav
            fontColor={fontColor}
            fontOpacity={fontOpacity}
            bgColor={topNavBg}
            bgOpacity={topNavBgOpacity}
          />
        </div>
        {/* Main Content Section */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
