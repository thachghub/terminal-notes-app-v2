'use client';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function FontColorPicker() {
  const fontColor = usePreferencesStore(s => s.fontColor);
  const setFontColor = usePreferencesStore(s => s.setFontColor);

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="font-color" className="whitespace-nowrap">Font Color</label>
      <input
        id="font-color"
        type="color"
        value={fontColor}
        onChange={(e) => setFontColor(e.target.value)}
        className="w-12 h-8 p-0 border-none bg-transparent"
      />
    </div>
  );
} 