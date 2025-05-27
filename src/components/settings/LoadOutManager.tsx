'use client';

import { usePreferencesStore } from '@/store/preferencesStore';
import { useState, useRef, useCallback } from 'react';

const loadOutKeys = ['LoadOut1', 'LoadOut2', 'LoadOut3', 'LoadOut4', 'LoadOut5'];

export default function LoadOutManager() {
  const savedLoadOuts = usePreferencesStore(s => s.savedLoadOuts);
  const saveLoadOut = usePreferencesStore(s => s.saveLoadOut);
  const loadLoadOut = usePreferencesStore(s => s.loadLoadOut);
  const resetLoadOut = usePreferencesStore(s => s.resetLoadOut);
  const loadOutLabels = usePreferencesStore(s => s.loadOutLabels);
  const renameLoadOut = usePreferencesStore(s => s.renameLoadOut);

  const [confirmReset, setConfirmReset] = useState<string | null>(null);
  const renameTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const debouncedRename = useCallback((key: string, value: string) => {
    if (renameTimeouts.current[key]) {
      clearTimeout(renameTimeouts.current[key]);
    }

    renameTimeouts.current[key] = setTimeout(() => {
      renameLoadOut(key, value);
    }, 300);
  }, [renameLoadOut]);

  return (
    <div className="space-y-3 mt-6 border-t border-cyan-900 pt-4">
      <h3 className="text-md font-semibold text-cyan-300 font-mono uppercase tracking-wide mb-2">Preference Load Outs</h3>
      {loadOutKeys.map((key) => {
        const isSaved = !!savedLoadOuts[key];
        return (
          <div
            key={key}
            className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 items-center py-1 border-b border-cyan-900 last:border-none font-mono"
          >
            <input
              className="bg-transparent text-cyan-300 focus:outline-none font-mono w-full text-xs border-b border-cyan-700 mb-1"
              value={loadOutLabels[key] ?? key}
              onChange={(e) => debouncedRename(key, e.target.value)}
              placeholder={key}
              disabled={!isSaved}
            />
            {isSaved && savedLoadOuts[key] && (
              <div className="flex items-center gap-2 text-xs text-cyan-500">
                <div
                  className="w-4 h-4 border border-cyan-700"
                  style={{ backgroundColor: savedLoadOuts[key].fontColor }}
                />
                <span>{savedLoadOuts[key].timezone}</span>
                <span>{Math.round(savedLoadOuts[key].fontOpacity * 100)}%</span>
                {savedLoadOuts[key].showSeconds && <span className="text-cyan-400">🕒</span>}
              </div>
            )}
            <div className="flex gap-1 justify-end">
              <button className="text-green-400 hover:underline font-mono text-xs" onClick={() => saveLoadOut(key)}>Save</button>
              <button className="text-blue-400 hover:underline font-mono text-xs" disabled={!isSaved} onClick={() => loadLoadOut(key)}>Load</button>
              <button className="text-red-400 hover:underline font-mono text-xs" disabled={!isSaved} onClick={() => confirmReset === key ? resetLoadOut(key) : setConfirmReset(key)}>
                {confirmReset === key ? 'Confirm' : 'Reset'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
} 