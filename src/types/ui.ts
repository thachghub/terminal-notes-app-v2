export interface TimezoneDropdownProps {
  timezone: string;
  setTimezone: (value: string) => void;
}

export interface ColorPickerProps {
  color: string;
  setColor: (value: string) => void;
}

export interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

// Add more interfaces here as you decompose components. 