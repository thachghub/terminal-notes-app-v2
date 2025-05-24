'use client';
// src/components/SettingsDashboard.tsx
import DashboardLayout from "./DashboardLayout";

import { useState } from "react";

export default function SettingsDashboard() {
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
    <DashboardLayout>
      <div className="flex flex-col items-start h-full w-full pt-8 pl-8">
        <button
          className="mb-4 px-4 py-2 text-base border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-900 transition-colors"
          onClick={() => setShowCustomize(v => !v)}
        >
          Customize Widgets
        </button>
        {showCustomize && (
          <div className="p-4 bg-[#0f2124] border border-cyan-700 rounded shadow max-w-xs w-full">
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
      </div>
    </DashboardLayout>
  );
}
