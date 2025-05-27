'use client';

// src/components/TerminalDisplay.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import TerminalTitle from './TerminalTitle';
import TerminalDisplayWidgets from './TerminalDisplayWidgets';
import { hexToRgba, darkenHex } from '@/lib/colorUtils';
import { useUIStore } from '@/store/uiStore';

export default function TerminalDisplay({ 
  fontColor, 
  fontOpacity, 
  bgColor, 
  bgOpacity,
  children,
  title
}: {
  fontColor?: string;
  fontOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
  children?: React.ReactNode;
  title?: string;
}) {
  const showSignIn = useUIStore((s) => s.showSignIn);
  const showSignUp = useUIStore((s) => s.showSignUp);
  const setShowSignIn = useUIStore((s) => s.setShowSignIn);
  const setShowSignUp = useUIStore((s) => s.setShowSignUp);
  const isAuthLoading = useUIStore((s) => s.isAuthLoading);
  const authError = useUIStore((s) => s.authError);
  const setAuthLoading = useUIStore((s) => s.setAuthLoading);
  const setAuthError = useUIStore((s) => s.setAuthError);

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };

  const textColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#67e8f9';
  const backgroundColor = bgColor ? hexToRgba(bgColor, bgOpacity) : '#062c33';

  const gradientStart = backgroundColor;
  const gradientEnd = bgColor ? darkenHex(bgColor, 0.18) : '#03161a';

  async function handleSignInSubmit() {
    setAuthLoading(true);
    setAuthError(null);
    try {
      // TODO: Replace with real sign-in logic
      await new Promise((res) => setTimeout(res, 1000));
      setShowSignIn(false);
    } catch (err: any) {
      setAuthError(err.message || 'Sign-in failed');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignUpSubmit() {
    setAuthLoading(true);
    setAuthError(null);
    try {
      // TODO: Replace with real sign-up logic
      await new Promise((res) => setTimeout(res, 1000));
      setShowSignUp(false);
    } catch (err: any) {
      setAuthError(err.message || 'Sign-up failed');
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <main className="flex flex-col gap-8 p-4 h-full min-h-full bg-transparent" style={{ color: textColor }} aria-label="Terminal Main Content">
      <header className="flex flex-col gap-8">
        {title ? (
          <h1 className="text-cyan-400 text-4xl font-[VT323] tracking-tight">{title}</h1>
        ) : (
          <TerminalTitle />
        )}
        <TerminalDisplayWidgets />
      </header>
      
      <section className="masterloginpanel mt-8 bg-transparent" aria-label="Authentication Panel">
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleSignInClick}
            className="inline-block border border-cyan-500 text-cyan-500 hover:text-yellow-400 hover:bg-cyan-500/10 transition-colors px-3 py-1 text-sm w-32"
            aria-label="Open sign in form"
          >
            / sign in
          </button>
          <button
            onClick={handleSignUpClick}
            className="inline-block border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-colors px-3 py-1 text-sm w-32"
            aria-label="Open create account form"
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
              aria-label="Sign In Form"
            >
              <div>/ sign in</div>
              <label htmlFor="signin-email">email:</label>
              <input type="email" id="signin-email" className="border-b border-cyan-500 text-cyan-500 bg-transparent" aria-label="Email address" />
              <label htmlFor="signin-password">password:</label>
              <input type="password" id="signin-password" className="border-b border-cyan-500 text-cyan-500 bg-transparent" aria-label="Password" />
              {isAuthLoading && <p>Signing in...</p>}
              {authError && <p className="text-red-500">{authError}</p>}
              <div className="flex gap-3 mt-2">
                <button 
                  className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 hover:text-yellow-400 transition-colors"
                  onClick={handleSignInSubmit}
                  aria-label="Submit sign in"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? 'Loading…' : '> sign in'}
                </button>
                <button
                  type="button"
                  className="text-cyan-400 underline underline-offset-2 hover:text-yellow-400 transition-colors"
                  onClick={() => alert('Forgot password flow coming soon!')}
                  aria-label="Forgot password"
                  disabled={isAuthLoading}
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
              aria-label="Create Account Form"
            >
              <div>/ create account</div>
              <label htmlFor="signup-email" className="text-yellow-400" style={{ color: '#FFD700' }}>email:</label>
              <input type="email" id="signup-email" className="border-b border-yellow-400 text-yellow-400 bg-transparent" aria-label="Email address" />
              <label htmlFor="signup-password" className="text-yellow-400" style={{ color: '#FFD700' }}>password:</label>
              <input type="password" id="signup-password" className="border-b border-yellow-400 text-yellow-400 bg-transparent" aria-label="Password" />
              {isAuthLoading && <p>Signing up...</p>}
              {authError && <p className="text-red-500">{authError}</p>}
              <button 
                className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-colors mt-2"
                onClick={handleSignUpSubmit}
                aria-label="Submit create account"
                disabled={isAuthLoading}
              >
                {isAuthLoading ? 'Loading…' : '> sign up'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {children && (
        <div className="flex-1 mt-8">
          {children}
        </div>
      )}
    </main>
  );
}
