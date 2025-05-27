'use client';

import { usePreferencesStore } from '@/store/preferencesStore';
import { useState } from 'react';

const loadOutKeys = ['LoadOut1', 'LoadOut2', 'LoadOut3', 'LoadOut4', 'LoadOut5'];

export default function LoadOutManager() {
  const { savedLoadOuts, saveLoadOut, loadLoadOut, resetLoadOut, loadOutLabels, renameLoadOut } = usePreferencesStore((s) => ({
    savedLoadOuts: s.savedLoadOuts,
    saveLoadOut: s.saveLoadOut,
    loadLoadOut: s.loadLoadOut,
    resetLoadOut: s.resetLoadOut,
    loadOutLabels: s.loadOutLabels,
    renameLoadOut: s.renameLoadOut,
  }));

  const [confirmReset, setConfirmReset] = useState<string | null>(null);

  return (
    <div className="space-y-3 mt-6 border-t pt-4">
      <h3 className="text-md font-semibold">Preference Load Outs</h3>
      {loadOutKeys.map((key) => {
        const isSaved = !!savedLoadOuts[key];
        return (
          <div key={key} className="flex items-center justify-between gap-2">
            <div className="text-sm w-32">
              <input
                className="bg-transparent border-b text-sm font-semibold w-32 mb-1 focus:outline-none"
                value={loadOutLabels[key] ?? key}
                onChange={(e) => renameLoadOut(key, e.target.value)}
                placeholder={key}
                disabled={!isSaved}
              />
              {isSaved && (
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-300">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: savedLoadOuts[key].fontColor }}
                    title={`Font color: ${savedLoadOuts[key].fontColor}`}
                  />
                  <span>{savedLoadOuts[key].timezone}</span>
                  <span>{Math.round(savedLoadOuts[key].fontOpacity * 100)}%</span>
                  {savedLoadOuts[key].showSeconds && <span title="Show seconds">🕒</span>}
                </div>
              )}
            </div>
            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => saveLoadOut(key)}
                className="px-2 py-1 bg-green-600 text-white rounded text-sm"
              >
                Save
              </button>
              <button
                disabled={!isSaved}
                onClick={() => loadLoadOut(key)}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-40"
              >
                Load
              </button>
              <button
                disabled={!isSaved}
                onClick={() =>
                  confirmReset === key ? resetLoadOut(key) : setConfirmReset(key)
                }
                className="px-2 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-40"
              >
                {confirmReset === key ? 'Confirm' : 'Reset'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
} 