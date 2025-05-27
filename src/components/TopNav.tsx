// src/components/TopNav.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { hexToRgba, darkenHex } from '@/lib/colorUtils';

export default function TopNav({ fontColor, fontOpacity, bgColor, bgOpacity }: {
  fontColor?: string;
  fontOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
}) {
  const textColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#22d3ee';
  const backgroundColor = bgColor ? hexToRgba(bgColor, bgOpacity) : '#0f2124';
  const borderColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#06b6d4';

  const gradientStart = backgroundColor;
  const gradientEnd = bgColor ? darkenHex(bgColor, 0.18) : '#0a1417';

  return (
    <header aria-label="Top Navigation Bar">
      <div
        className="flex items-start space-x-2 min-h-[3.5rem] py-2"
      >
        {/* Nav Buttons */}
        <button style={{ borderColor }} className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]" aria-label="Create new note">
          &gt; New Note
        </button>
        <button style={{ borderColor }} className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]" aria-label="View notes">
          &gt; View Notes
        </button>
        <button style={{ borderColor }} className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]" aria-label="Log entry">
          &gt; Log Entry
        </button>
        <button style={{ borderColor }} className="px-4 border text-cyan-300 hover:text-yellow-400 text-sm whitespace-normal py-2 h-auto min-h-[2.5rem]" aria-label="Log in or out">
          &gt; Log-in-out
        </button>
      </div>
    </header>
  );
}