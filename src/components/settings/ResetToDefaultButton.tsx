'use client';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function ResetToDefaultButton() {
  const reset = usePreferencesStore(s => s.resetToDefault);

  return (
    <div className="mt-4 border-t border-cyan-900 pt-4">
      <h3 className="text-md font-semibold mb-2 text-cyan-300 font-mono uppercase tracking-wide">Reset</h3>
      <button
        onClick={reset}
        className="text-yellow-300 uppercase tracking-wide text-xs hover:underline font-mono"
      >
        Reset to Hyper Terminal Default
      </button>
    </div>
  );
} 