import { ToggleProps } from '@/types/ui';

// TODO: Replace ToggleProps with actual props for blur slider
export default function BackgroundBlurSlider({ value, onChange, label }: ToggleProps) {
  return (
    <div>
      <label htmlFor="background-blur-slider">{label}</label>
      <input
        id="background-blur-slider"
        type="range"
        min={0}
        max={10}
        value={value ? 5 : 0}
        onChange={e => onChange(Number(e.target.value) > 0)}
        aria-label={label}
      />
    </div>
  );
} 