// src/components/TerminalDisplay.tsx

import TerminalTitle from './TerminalTitle';
import TerminalDisplayWidgets from './TerminalDisplayWidgets';

export default function TerminalDisplay() {
  return (
    <div className="w-full min-h-screen bg-[#062c33] pt-6 px-4">
      <TerminalTitle />
      <TerminalDisplayWidgets />
    </div>
  );
}
