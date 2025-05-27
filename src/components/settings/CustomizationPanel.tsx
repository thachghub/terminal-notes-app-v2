'use client';
import FontColorPicker from './FontColorPicker';
import FontOpacitySlider from './FontOpacitySlider';
import TimezoneSelector from './TimezoneSelector';
import ShowSecondsToggle from './ShowSecondsToggle';
import LoadOutManager from './LoadOutManager';
import ResetToDefaultButton from './ResetToDefaultButton';

export default function CustomizationPanel() {
  return (
    <div className="space-y-4 p-4 border rounded bg-neutral-800 text-white">
      <h2 className="text-lg font-bold">Customization Settings</h2>
      <FontColorPicker />
      <FontOpacitySlider />
      <TimezoneSelector />
      <ShowSecondsToggle />
      <ResetToDefaultButton />
      <LoadOutManager />
    </div>
  );
} 