'use client';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function ShowKeyTutorialToggle() {
  const showKeyTutorial = usePreferencesStore(s => s.showKeyTutorial);
  const setShowKeyTutorial = usePreferencesStore(s => s.setShowKeyTutorial);

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="show-key-tutorial" className="whitespace-nowrap">Show Key Tutorial</label>
      <input
        id="show-key-tutorial"
        type="checkbox"
        checked={showKeyTutorial}
        onChange={e => setShowKeyTutorial(e.target.checked)}
        className="accent-cyan-500"
      />
    </div>
  );
} 