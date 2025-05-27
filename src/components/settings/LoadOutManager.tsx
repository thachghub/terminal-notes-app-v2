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
    <div className="space-y-3 mt-6">
      <h3 className="uppercase text-cyan-300 tracking-wide text-xs font-mono mb-2">Preference Load Outs</h3>
      {loadOutKeys.map((key) => {
        const isSaved = !!savedLoadOuts[key];
        return (
          <div
            key={key}
            className="flex items-center gap-4 py-1 text-sm"
          >
            <input
              className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none mr-2"
              value={loadOutLabels[key] ?? key}
              onChange={(e) => debouncedRename(key, e.target.value)}
              placeholder={key}
              disabled={!isSaved}
              style={{ width: 100 }}
            />
            <div className="flex gap-2 text-xs">
              <button className="text-green-400 hover:underline font-mono" onClick={() => saveLoadOut(key)}>Save</button>
              <button className="text-blue-400 hover:underline font-mono" disabled={!isSaved} onClick={() => loadLoadOut(key)}>Load</button>
              <button className="text-red-400 hover:underline font-mono" disabled={!isSaved} onClick={() => confirmReset === key ? resetLoadOut(key) : setConfirmReset(key)}>
                {confirmReset === key ? 'Confirm' : 'Reset'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
} 