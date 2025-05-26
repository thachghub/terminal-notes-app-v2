// src/components/TopNav.tsx

import { motion, AnimatePresence } from 'framer-motion';

export default function TopNav({ fontColor, fontOpacity, bgColor, bgOpacity }: {
  fontColor?: string;
  fontOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
}) {
  // Helper to convert hex + opacity to rgba
  function hexToRgba(hex: string, alpha: number = 1) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const textColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#22d3ee';
  const backgroundColor = bgColor ? hexToRgba(bgColor, bgOpacity) : '#0f2124';
  const borderColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#06b6d4';

  // Helper to darken a hex color
  function darkenHex(hex: string, percent: number) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.floor(r * (1 - percent));
    g = Math.floor(g * (1 - percent));
    b = Math.floor(b * (1 - percent));
    return `rgba(${r},${g},${b},${bgOpacity ?? 1})`;
  }
  const gradientStart = backgroundColor;
  const gradientEnd = bgColor ? darkenHex(bgColor, 0.18) : '#0a1417';

  return (
    <div
      className="flex items-start space-x-2 min-h-[3.5rem] py-2"
    >
      {/* Nav Buttons */}
      <button style={{ borderColor }} className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]">
        &gt; New Note
      </button>
      <button style={{ borderColor }} className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]">
        &gt; View Notes
      </button>
      <button style={{ borderColor }} className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]">
        &gt; Log Entry
      </button>

      <button style={{ borderColor }} className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]">
        &gt; Log-in-out
      </button>
    </div>
  );
}