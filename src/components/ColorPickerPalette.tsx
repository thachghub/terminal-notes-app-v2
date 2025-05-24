// src/components/ColorPickerPalette.tsx
'use client';
import { useState } from "react";

export interface ColorPickerPaletteProps {
  label: string;
  color: string;
  opacity?: number;
  onChange: (color: string, opacity: number) => void;
}

export default function ColorPickerPalette({ label, color, opacity = 1, onChange }: ColorPickerPaletteProps) {
  // For now, use a native input[type=color] and RGB input as placeholder
  const [r, setR] = useState(parseInt(color.slice(1, 3), 16));
  const [g, setG] = useState(parseInt(color.slice(3, 5), 16));
  const [b, setB] = useState(parseInt(color.slice(5, 7), 16));

  function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newColor = e.target.value;
    setR(parseInt(newColor.slice(1, 3), 16));
    setG(parseInt(newColor.slice(3, 5), 16));
    setB(parseInt(newColor.slice(5, 7), 16));
    onChange(newColor, opacity);
  }

  function handleRGBChange(channel: 'r' | 'g' | 'b', value: number) {
    let nr = channel === 'r' ? value : r;
    let ng = channel === 'g' ? value : g;
    let nb = channel === 'b' ? value : b;
    setR(nr); setG(ng); setB(nb);
    const hex = `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
    onChange(hex, opacity);
  }

  function handleOpacityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const alpha = parseFloat(e.target.value);
    onChange(color, alpha);
  }

  return (
    <div className="flex flex-col gap-2 mb-4 p-2 bg-[#062c33] rounded border border-cyan-700 w-full max-w-xs">
      <span className="text-cyan-300 text-xs font-bold mb-1">{label}</span>
      <input type="color" value={color} onChange={handleColorChange} className="w-10 h-10 rounded-full border border-cyan-500" />
      <div className="flex gap-2 items-center">
        <span className="text-cyan-400 text-xs">R</span>
        <input type="number" min={0} max={255} value={r} onChange={e => handleRGBChange('r', Number(e.target.value))} className="w-12 px-1 py-0.5 rounded bg-[#0f2124] text-cyan-100 border border-cyan-600" />
        <span className="text-cyan-400 text-xs">G</span>
        <input type="number" min={0} max={255} value={g} onChange={e => handleRGBChange('g', Number(e.target.value))} className="w-12 px-1 py-0.5 rounded bg-[#0f2124] text-cyan-100 border border-cyan-600" />
        <span className="text-cyan-400 text-xs">B</span>
        <input type="number" min={0} max={255} value={b} onChange={e => handleRGBChange('b', Number(e.target.value))} className="w-12 px-1 py-0.5 rounded bg-[#0f2124] text-cyan-100 border border-cyan-600" />
      </div>
      <div className="flex gap-2 items-center mt-2">
        <span className="text-cyan-400 text-xs">Opacity</span>
        <input
          type="range"
          min={0} max={1} step={0.01}
          value={opacity}
          onChange={handleOpacityChange}
          className="w-24 accent-cyan-500"
        />
        <input
          type="number"
          min={0} max={1} step={0.01}
          value={opacity}
          onChange={handleOpacityChange}
          className="w-14 px-1 py-0.5 rounded bg-[#0f2124] text-cyan-100 border border-cyan-600"
        />
      </div>
    </div>
  );
}
