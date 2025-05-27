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
    <div className="text-sm text-cyan-100 font-mono space-y-6">
      <div>
        <WidgetVisibilityToggle />
      </div>

      <div>
        <h3 className="uppercase text-cyan-300 tracking-wide text-xs mb-2 mt-6">Appearance</h3>
        <div className="space-y-4">
          <FontColorPicker />
          <FontOpacitySlider />
        </div>
      </div>

      <div>
        <h3 className="uppercase text-cyan-300 tracking-wide text-xs mb-2 mt-6">Clock Settings</h3>
        <div className="space-y-4">
          <TimezoneSelector />
          <ShowSecondsToggle />
        </div>
      </div>

      <div className="mt-6">
        <ResetToDefaultButton />
      </div>

      <div>
        <LoadOutManager />
      </div>
    </div>
  );
} 