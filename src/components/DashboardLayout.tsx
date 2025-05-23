// src/components/DashboardLayout.tsx

import TopNav from "./TopNav";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen text-cyan-300 font-mono">
      {/* Left Navigation Frame */}
      <Sidebar />

      {/* Right Frame */}
      <div className="flex flex-col flex-1 overflow-hidden bg-[#042336]">
        {/* Top Navigation Frame */}
        <div className="h-14 bg-[#062c33] border-b border-cyan-500 px-4 py-2">
          <TopNav />
        </div>

        {/* Main Content Section */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
