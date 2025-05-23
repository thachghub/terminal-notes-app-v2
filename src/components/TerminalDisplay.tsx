// src/components/TerminalDisplay.tsx

import TerminalTitle from './TerminalTitle';
import TerminalDisplayWidgets from './TerminalDisplayWidgets';

export default function TerminalDisplay() {
  return (
    <div className="w-full min-h-screen bg-[#062c33] pt-6 px-4">
      <TerminalTitle />
      <TerminalDisplayWidgets />
      <div className="masterloginpanel mt-8">
        <div className="panel">
          <div>/ sign in</div>
          <label htmlFor="signin-email">email:</label>
          <input type="email" id="signin-email" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
          <label htmlFor="signin-password">password:</label>
          <input type="password" id="signin-password" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
          <button className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors">
            &gt; sign in
          </button>
        </div>

        <div className="panel">
          <div>/ create account</div>
          <label htmlFor="signup-email">email:</label>
          <input type="email" id="signup-email" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
          <label htmlFor="signup-password">password:</label>
          <input type="password" id="signup-password" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
          <button className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors">
            &gt; sign up
          </button>
        </div>
      </div>
    </div>
  );
}
