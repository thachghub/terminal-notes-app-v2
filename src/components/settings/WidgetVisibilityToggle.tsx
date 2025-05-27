import { ToggleProps } from '@/types/ui';

export default function WidgetVisibilityToggle({ value, onChange, label }: ToggleProps) {
  return (
    <div>
      <label htmlFor="widget-visibility-toggle">{label}</label>
      <input
        id="widget-visibility-toggle"
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        role="switch"
        aria-label={label}
      />
    </div>
  );
} 