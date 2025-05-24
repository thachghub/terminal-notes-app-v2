// src/components/TerminalDisplay.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import TerminalTitle from './TerminalTitle';
import TerminalDisplayWidgets from './TerminalDisplayWidgets';

export default function TerminalDisplay() {
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

  return (
    <div className="flex flex-col gap-8 bg-[#062c33] p-4">
      <TerminalTitle />
      <TerminalDisplayWidgets />
      
      <div className="masterloginpanel mt-8">
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleSignInClick}
            className="inline-block border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors px-3 py-1 text-sm w-32"
          >
            / sign in
          </button>
          <button
            onClick={handleSignUpClick}
            className="inline-block border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors px-3 py-1 text-sm w-32"
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
              className="panel mt-4"
            >
              <div>/ sign in</div>
              <label htmlFor="signin-email">email:</label>
              <input type="email" id="signin-email" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
              <label htmlFor="signin-password">password:</label>
              <input type="password" id="signin-password" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
              <button 
                className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors mt-2"
                onClick={() => setShowSignIn(false)}
              >
                &gt; sign in
              </button>
            </motion.div>
          )}

          {showSignUp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="panel mt-4"
            >
              <div>/ create account</div>
              <label htmlFor="signup-email">email:</label>
              <input type="email" id="signup-email" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
              <label htmlFor="signup-password">password:</label>
              <input type="password" id="signup-password" className="border-b border-cyan-500 text-cyan-500 bg-transparent" />
              <button 
                className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors mt-2"
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
