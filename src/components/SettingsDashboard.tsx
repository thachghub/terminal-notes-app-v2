'use client';
// src/components/SettingsDashboard.tsx
import DashboardLayout from "./DashboardLayout";
import ColorPickerPalette from "./ColorPickerPalette";
import { useState } from "react";

// FontColorPanel: Modal for font color customization
function FontColorPanel({ fontColor, fontOpacity, onApply, onCancel }: {
  fontColor: string;
  fontOpacity: number;
  onApply: (color: string, opacity: number) => void;
  onCancel: () => void;
}) {
  const [tempColor, setTempColor] = useState<string>(fontColor);
  const [tempOpacity, setTempOpacity] = useState<number>(fontOpacity);
  return (
    <div className="p-4 bg-[#0f2124] border border-cyan-700 rounded shadow max-w-xs w-full flex flex-col gap-2">
      <div className="mb-2 text-cyan-300 text-sm font-bold">Font Color</div>
      <ColorPickerPalette label="Font Color" color={tempColor} opacity={tempOpacity} onChange={(c, a) => { setTempColor(c); setTempOpacity(a); }} />
      <div className="flex gap-2 mt-4">
        <button className="px-4 py-1 rounded bg-cyan-700 text-cyan-50 font-bold hover:bg-cyan-900" onClick={() => onApply(tempColor, tempOpacity)}>Apply</button>
        <button className="px-4 py-1 rounded bg-gray-700 text-cyan-200 hover:bg-gray-900" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// BgColorPanel: Modal for background color customization
function BgColorPanel({
  topNavBg, topNavBgOpacity, sidebarBg, sidebarBgOpacity, terminalBg, terminalBgOpacity, onApply, onCancel
}: {
  topNavBg: string;
  topNavBgOpacity: number;
  sidebarBg: string;
  sidebarBgOpacity: number;
  terminalBg: string;
  terminalBgOpacity: number;
  onApply: (topNavBg: string, topNavBgOpacity: number, sidebarBg: string, sidebarBgOpacity: number, terminalBg: string, terminalBgOpacity: number) => void;
  onCancel: () => void;
}) {
  const [tempTopNavBg, setTempTopNavBg] = useState<string>(topNavBg);
  const [tempTopNavBgOpacity, setTempTopNavBgOpacity] = useState<number>(topNavBgOpacity);
  const [tempSidebarBg, setTempSidebarBg] = useState<string>(sidebarBg);
  const [tempSidebarBgOpacity, setTempSidebarBgOpacity] = useState<number>(sidebarBgOpacity);
  const [tempTerminalBg, setTempTerminalBg] = useState<string>(terminalBg);
  const [tempTerminalBgOpacity, setTempTerminalBgOpacity] = useState<number>(terminalBgOpacity);
  return (
    <div className="p-4 bg-[#0f2124] border border-cyan-700 rounded shadow max-w-xs w-full flex flex-col gap-2">
      <div className="mb-2 text-cyan-300 text-sm font-bold">Background Colors</div>
      <ColorPickerPalette label="TopNav Background" color={tempTopNavBg} opacity={tempTopNavBgOpacity} onChange={(c, a) => { setTempTopNavBg(c); setTempTopNavBgOpacity(a); }} />
      <ColorPickerPalette label="Sidebar Background" color={tempSidebarBg} opacity={tempSidebarBgOpacity} onChange={(c, a) => { setTempSidebarBg(c); setTempSidebarBgOpacity(a); }} />
      <ColorPickerPalette label="TerminalDisplay Background" color={tempTerminalBg} opacity={tempTerminalBgOpacity} onChange={(c, a) => { setTempTerminalBg(c); setTempTerminalBgOpacity(a); }} />
      <div className="flex gap-2 mt-4">
        <button className="px-4 py-1 rounded bg-cyan-700 text-cyan-50 font-bold hover:bg-cyan-900" onClick={() => onApply(tempTopNavBg, tempTopNavBgOpacity, tempSidebarBg, tempSidebarBgOpacity, tempTerminalBg, tempTerminalBgOpacity)}>Apply</button>
        <button className="px-4 py-1 rounded bg-gray-700 text-cyan-200 hover:bg-gray-900" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function SettingsDashboard() {
  // LIFTED STATE FOR LIVE UI COLORS
  const [fontColor, setFontColor] = useState('#22d3ee');
  const [fontOpacity, setFontOpacity] = useState(1);
  const [topNavBg, setTopNavBg] = useState('#0f2124');
  const [topNavBgOpacity, setTopNavBgOpacity] = useState(1);
  const [sidebarBg, setSidebarBg] = useState('#062c33');
  const [sidebarBgOpacity, setSidebarBgOpacity] = useState(1);
  const [terminalBg, setTerminalBg] = useState('#062c33');
  const [terminalBgOpacity, setTerminalBgOpacity] = useState(1);

  // Local panel state
  const [showColors, setShowColors] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [visibleRows, setVisibleRows] = useState({
    user: true,
    date: true,
    time: true,
    week: true,
    sunrise: true,
    sunset: true,
  });

  function handleToggleRow(row: keyof typeof visibleRows) {
    setVisibleRows(v => ({ ...v, [row]: !v[row] }));
  }

  return (
    <DashboardLayout
      fontColor={fontColor}
      fontOpacity={fontOpacity}
      topNavBg={topNavBg}
      topNavBgOpacity={topNavBgOpacity}
      sidebarBg={sidebarBg}
      sidebarBgOpacity={sidebarBgOpacity}
      terminalBg={terminalBg}
      terminalBgOpacity={terminalBgOpacity}
    >
      <div className="flex flex-col items-start h-full w-full pt-8 pl-8 bg-white text-black rounded shadow">
        <button
          className="mb-4 px-4 py-2 text-base border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-900 transition-colors"
          onClick={() => setShowCustomize(v => !v)}
        >
          Customize Widgets
        </button>
        {showCustomize && (
          <div className="p-4 bg-[#0f2124] border border-cyan-700 rounded shadow max-w-xs w-full mb-4">
            <div className="mb-2 text-cyan-300 text-sm font-bold">Toggle widgets:</div>
            {Object.entries(visibleRows).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 text-cyan-400 text-sm cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={() => handleToggleRow(key as keyof typeof visibleRows)}
                  className="accent-cyan-500"
                />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            ))}
          </div>
        )}

        {/* Customize Colors Button & Panel */}
        <button
          className="mb-4 px-4 py-2 text-base border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-900 transition-colors"
          onClick={() => setShowColors((v: boolean) => !v)}
        >
          Customize Font Color
        </button>
        {showColors && (
          <FontColorPanel
            fontColor={fontColor} fontOpacity={fontOpacity}
            onApply={(c, o) => { setFontColor(c); setFontOpacity(o); setShowColors(false); }}
            onCancel={() => setShowColors(false)}
          />
        )}

        {/* Customize Background Color Button & Panel */}
        <button
          className="mb-4 px-4 py-2 text-base border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-900 transition-colors"
          onClick={() => setShowBgColors((v: boolean) => !v)}
        >
          Customize Background Color
        </button>
        {showBgColors && (
          <BgColorPanel
            topNavBg={topNavBg} topNavBgOpacity={topNavBgOpacity}
            sidebarBg={sidebarBg} sidebarBgOpacity={sidebarBgOpacity}
            terminalBg={terminalBg} terminalBgOpacity={terminalBgOpacity}
            onApply={(tbg, to, sbg, so, tdb, tdo) => {
              setTopNavBg(tbg); setTopNavBgOpacity(to);
              setSidebarBg(sbg); setSidebarBgOpacity(so);
              setTerminalBg(tdb); setTerminalBgOpacity(tdo);
              setShowBgColors(false);
            }}
            onCancel={() => setShowBgColors(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
