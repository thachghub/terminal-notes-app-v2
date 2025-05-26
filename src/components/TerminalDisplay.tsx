// src/components/TerminalDisplay.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import TerminalTitle from './TerminalTitle';
import TerminalDisplayWidgets from './TerminalDisplayWidgets';

export default function TerminalDisplay({ fontColor, fontOpacity, bgColor, bgOpacity }: {
  fontColor?: string;
  fontOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
}) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };

  // Helper to convert hex + opacity to rgba
  function hexToRgba(hex: string, alpha: number = 1) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const textColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#67e8f9';
  const backgroundColor = bgColor ? hexToRgba(bgColor, bgOpacity) : '#062c33';

  // Helper to darken a hex color
  function darkenHex(hex: string, percent: number) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.floor(r * (1 - percent));
    g = Math.floor(g * (1 - percent));
    b = Math.floor(b * (1 - percent));
    return `rgba(${r},${g},${b},${bgOpacity ?? 1})`;
  }
  const gradientStart = backgroundColor;
  const gradientEnd = bgColor ? darkenHex(bgColor, 0.18) : '#03161a';

  return (
    <div className="flex flex-col gap-8 p-4 h-full min-h-0" style={{ background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`, color: textColor }}>
      <TerminalTitle />
      <TerminalDisplayWidgets />
      
      <div className="masterloginpanel mt-8 bg-transparent">
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleSignInClick}
            className="inline-block border border-cyan-500 text-cyan-500 hover:text-yellow-400 hover:bg-cyan-500/10 transition-colors px-3 py-1 text-sm w-32"
          >
            / sign in
          </button>
          <button
            onClick={handleSignUpClick}
            className="inline-block border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-colors px-3 py-1 text-sm w-32"
          >
            / create account
          </button>
        </div>

        <AnimatePresence>
          {showSignIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="panel mt-4 bg-transparent"
            >
              <div>/ sign in</div>
              <label htmlFor="signin-email">email:</label>
              <input type="email" id="signin-email" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
              <label htmlFor="signin-password">password:</label>
              <input type="password" id="signin-password" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
              <div className="flex gap-3 mt-2">
                <button 
                  className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 hover:text-yellow-400 transition-colors"
                  onClick={() => setShowSignIn(false)}
                >
                  &gt; sign in
                </button>
                <button
                  type="button"
                  className="text-cyan-400 underline underline-offset-2 hover:text-yellow-400 transition-colors"
                  onClick={() => alert('Forgot password flow coming soon!')}
                >
                  forgot password
                </button>
              </div>
            </motion.div>
          )}

          {showSignUp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="panel mt-4 border-2 text-yellow-400 bg-transparent"
              style={{ borderColor: '#FFD700' }}
            >
              <div>/ create account</div>
              <label htmlFor="signup-email" className="text-yellow-400" style={{ color: '#FFD700' }}>email:</label>
              <input type="email" id="signup-email" className="border-b border-yellow-400 text-yellow-400 bg-transparent" />
              <label htmlFor="signup-password" className="text-yellow-400" style={{ color: '#FFD700' }}>password:</label>
              <input type="password" id="signup-password" className="border-b border-yellow-400 text-yellow-400 bg-transparent" />
              <button 
                className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-colors mt-2"
                onClick={() => setShowSignUp(false)}
              >
                &gt; sign up
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
