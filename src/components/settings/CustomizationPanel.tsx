'use client';
import FontColorPicker from './FontColorPicker';
import FontOpacitySlider from './FontOpacitySlider';
import TimezoneSelector from './TimezoneSelector';
import ShowSecondsToggle from './ShowSecondsToggle';
import LoadOutManager from './LoadOutManager';
import ResetToDefaultButton from './ResetToDefaultButton';
import WidgetVisibilityToggle from './WidgetVisibilityToggle';

export default function CustomizationPanel() {
  return (
    <div className="border border-cyan-500 p-4 space-y-6 font-mono text-sm text-cyan-100 bg-transparent">
      <WidgetVisibilityToggle />
      <h2 className="text-base border-b border-cyan-700 pb-1 uppercase tracking-wide">Customization Panel</h2>
      <FontColorPicker />
      <FontOpacitySlider />
      <TimezoneSelector />
      <ShowSecondsToggle />
      <ResetToDefaultButton />
      <LoadOutManager />
    </div>
  );
} 