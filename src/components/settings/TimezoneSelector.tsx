import { ToggleProps } from '@/types/ui';

// TODO: Replace ToggleProps with actual props for timezone selection
export default function TimezoneSelector({ value, onChange, label }: ToggleProps) {
  return (
    <div>
      <label htmlFor="timezone-selector">{label}</label>
      <select id="timezone-selector" onChange={e => onChange(e.target.value === 'true')} aria-label={label}>
        <option value="true">Timezone 1</option>
        <option value="false">Timezone 2</option>
      </select>
    </div>
  );
} 