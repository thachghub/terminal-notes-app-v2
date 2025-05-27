'use client';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function ResetToDefaultButton() {
  const reset = usePreferencesStore(s => s.resetToDefault);

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="text-md font-semibold mb-2">Reset</h3>
      <button
        onClick={reset}
        className="bg-yellow-500 text-black px-3 py-1 rounded text-sm"
      >
        Restore Hyper Terminal Default
      </button>
    </div>
  );
} 