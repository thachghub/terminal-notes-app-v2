export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function darkenHex(hex: string, percent: number): string {
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) * (1 - percent / 100));
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) * (1 - percent / 100));
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) * (1 - percent / 100));
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
} 