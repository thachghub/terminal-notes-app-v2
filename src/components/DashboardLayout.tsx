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
        <div className="h-14 px-4 py-2" style={{ background: "none" }}>
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
