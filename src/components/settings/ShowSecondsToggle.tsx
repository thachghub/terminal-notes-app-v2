import { ToggleProps } from '@/types/ui';

export default function ShowSecondsToggle({ value, onChange, label }: ToggleProps) {
  return (
    <div>
      <label htmlFor="toggle-seconds">{label}</label>
      <input
        id="toggle-seconds"
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        role="switch"
        aria-label={label}
      />
    </div>
  );
} 