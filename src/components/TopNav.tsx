// src/components/TopNav.tsx

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

  return (
    <div className="flex items-center h-full space-x-2" style={{ backgroundColor }}>
      {/* Nav Buttons */}
      <button style={{ color: textColor, borderColor }} className="h-8 px-4 border text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt; New Note
      </button>
      <button style={{ color: textColor, borderColor }} className="h-8 px-4 border text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt; View Notes
      </button>
      <button style={{ color: textColor, borderColor }} className="h-8 px-4 border text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt; Log Entry
      </button>
      <a href="/settings">
        <button style={{ color: textColor, borderColor }} className="h-8 px-4 border text-cyan-300 hover:text-black hover:bg-cyan-500">
          &gt; Settings
        </button>
      </a>
      <button style={{ color: textColor, borderColor }} className="h-8 px-4 border text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt; Log-in-out
      </button>
    </div>
  );
}