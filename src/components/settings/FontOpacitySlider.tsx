'use client';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function FontOpacitySlider() {
  const fontOpacity = usePreferencesStore(s => s.fontOpacity);
  const setFontOpacity = usePreferencesStore(s => s.setFontOpacity);

  return (
    <div>
      <label htmlFor="font-opacity">Font Opacity</label>
      <input
        id="font-opacity"
        type="range"
        min={0.1}
        max={1}
        step={0.01}
        value={fontOpacity}
        onChange={(e) => setFontOpacity(Number(e.target.value))}
        className="w-32"
      />
      <span className="ml-2">{Math.round(fontOpacity * 100)}%</span>
    </div>
  );
} 