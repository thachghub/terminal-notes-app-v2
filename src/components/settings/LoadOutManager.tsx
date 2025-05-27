'use client';

import { usePreferencesStore } from '@/store/preferencesStore';
import { useState } from 'react';

const loadOutKeys = ['LoadOut1', 'LoadOut2', 'LoadOut3', 'LoadOut4', 'LoadOut5'];

export default function LoadOutManager() {
  const { savedLoadOuts, saveLoadOut, loadLoadOut, resetLoadOut } = usePreferencesStore((s) => ({
    savedLoadOuts: s.savedLoadOuts,
    saveLoadOut: s.saveLoadOut,
    loadLoadOut: s.loadLoadOut,
    resetLoadOut: s.resetLoadOut,
  }));

  const [confirmReset, setConfirmReset] = useState<string | null>(null);

  return (
    <div className="space-y-3 mt-6 border-t pt-4">
      <h3 className="text-md font-semibold">Preference Load Outs</h3>
      {loadOutKeys.map((key) => {
        const isSaved = !!savedLoadOuts[key];
        return (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-sm w-24">{key}</span>
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
        );
      })}
    </div>
  );
} 