import { ColorPickerProps } from '@/types/ui';

export default function PrimaryColorPicker({ color, setColor }: ColorPickerProps) {
  return (
    <div>
      <label htmlFor="primary-color-picker">Primary Color</label>
      <input
        id="primary-color-picker"
        type="color"
        value={color}
        onChange={e => setColor(e.target.value)}
        aria-label="Primary Color"
      />
    </div>
  );
} 