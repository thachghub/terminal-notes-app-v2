'use client';

// src/components/TerminalDisplay.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import TerminalTitle from './TerminalTitle';
import TerminalDisplayWidgets from './TerminalDisplayWidgets';
import EntryTerminal from './EntryTerminal';
import { hexToRgba, darkenHex } from '@/lib/colorUtils';
import { useUIStore } from '@/store/uiStore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { emailVerificationSettings } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function TerminalDisplay({ 
  fontColor, 
  fontOpacity, 
  bgColor, 
  bgOpacity,
  children,
  title,
  subtitle,
  hideAuthPanel,
  showEntryTerminal
}: {
  fontColor?: string;
  fontOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  hideAuthPanel?: boolean;
  showEntryTerminal?: boolean;
}) {
  const showSignIn = useUIStore((s) => s.showSignIn);
  const showSignUp = useUIStore((s) => s.showSignUp);
  const setShowSignIn = useUIStore((s) => s.setShowSignIn);
  const setShowSignUp = useUIStore((s) => s.setShowSignUp);
  const isAuthLoading = useUIStore((s) => s.isAuthLoading);
  const authError = useUIStore((s) => s.authError);
  const setAuthLoading = useUIStore((s) => s.setAuthLoading);
  const setAuthError = useUIStore((s) => s.setAuthError);
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const { t } = useTranslation();

  // State for form inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showResendSignUp, setShowResendSignUp] = useState(false);
  const [showSignUpSuccess, setShowSignUpSuccess] = useState(false);

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
    setAuthError(null);
    setSuccessMessage('');
    setShowSignUpSuccess(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
    setAuthError(null);
    setSuccessMessage('');
    setShowResendSignUp(false);
    setShowSignUpSuccess(false);
  };

  const textColor = fontColor ? hexToRgba(fontColor, fontOpacity) : '#67e8f9';
  const backgroundColor = bgColor ? hexToRgba(bgColor, bgOpacity) : '#062c33';

  const gradientStart = backgroundColor;
  const gradientEnd = bgColor ? darkenHex(bgColor, 0.18) : '#03161a';

  async function handleSignInSubmit() {
    if (!signInEmail || !signInPassword) {
      setAuthError('Please enter both email and password');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      
      // Check if email is verified
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await signOut(auth);
        setAuthError('Please verify your email before logging in.');
        return;
      }

      // Success - close form and show welcome message
      setSuccessMessage('Login successful!');
      setShowSignIn(false);
      setSignInEmail('');
      setSignInPassword('');
      
      // Show welcome message
      setTimeout(() => {
        setSuccessMessage('');
        setShowWelcome(true);
        setWelcomeStep(0);
      }, 1000);
    } catch (err: any) {
      setAuthError(err.message || 'Sign-in failed');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignUpSubmit() {
    if (!signUpEmail || !signUpPassword) {
      setAuthError('Please enter both email and password');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setShowResendSignUp(false);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      
              // Send verification email with custom continue URL
        if (userCredential.user) {
          await sendEmailVerification(userCredential.user, emailVerificationSettings);
        
        // Sign out the user immediately after registration
        await signOut(auth);
        
        // Success - show success panel instead of redirecting
        setSuccessMessage('');
        setShowSignUp(false);
        setShowSignUpSuccess(true);
        setSignUpEmail('');
        setSignUpPassword('');
      }
    } catch (err: any) {
      // Handle email already in use error
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('Email already in use. If you haven\'t verified your email, you can resend the verification.');
        setShowResendSignUp(true);
      } else {
        setAuthError(err.message || 'Sign-up failed');
      }
    } finally {
      setAuthLoading(false);
    }
  }

  const handleResendSignUpVerification = async () => {
    if (!signUpEmail) {
      setAuthError(t('please_enter_email_first'));
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      // Try to sign in with the email to get the user object
      const userCredential = await signInWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      if (userCredential.user && !userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user, emailVerificationSettings);
        await signOut(auth); // Sign out immediately after sending verification
        setSuccessMessage(t('verification_email_resent'));
        setShowResendSignUp(false);
      } else if (userCredential.user && userCredential.user.emailVerified) {
        await signOut(auth);
        setAuthError(t('email_already_verified'));
        setShowResendSignUp(false);
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setAuthError(t('incorrect_password_resend_verification'));
      } else {
        setAuthError(t('failed_to_resend_verification', { error: err.message }));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!signInEmail) {
      setAuthError(t('please_enter_email_first'));
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, signInEmail);
      setAuthError(null);
      alert(t('password_reset_email_sent', { email: signInEmail }));
    } catch (err: any) {
      setAuthError(err.message || t('failed_to_send_password_reset'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignInKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignInSubmit();
    }
  };

  const handleSignUpKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignUpSubmit();
    }
  };

  // Welcome message typing effect
  useEffect(() => {
    if (showWelcome && welcomeStep < 4) {
      const timer = setTimeout(() => {
        setWelcomeStep(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else if (showWelcome && welcomeStep === 4) {
      // After welcome message is complete, wait 20 seconds then auto-close
      const timer = setTimeout(() => {
        handleCloseWelcome();
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, welcomeStep]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    setWelcomeStep(0);
    router.push('/userdashboard');
  };

  return (
    <main className="flex flex-col gap-8 p-4 h-full min-h-full bg-transparent" style={{ color: textColor }} aria-label="Terminal Main Content">
      {/* Welcome Message - Fixed at Top */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            aria-label="Welcome Message"
          >
            <div className="border border-green-400 bg-black/95 backdrop-blur-sm p-6 rounded-lg shadow-2xl">
              <div className="space-y-2 font-mono">
                <div className="flex justify-between items-center">
                  <div className="text-green-400 text-lg">$ system --welcome</div>
                  <button
                    onClick={handleCloseWelcome}
                    className="text-gray-400 hover:text-white transition-colors px-2 py-1 text-sm border border-gray-600 hover:border-gray-400 rounded"
                    aria-label="Close welcome message"
                  >
                    close
                  </button>
                </div>
                <div className="text-cyan-300">
                  {welcomeStep >= 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-green-400">✓</span>
                      <span>Authentication successful</span>
                    </motion.div>
                  )}
                  {welcomeStep >= 2 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <span className="text-green-400">✓</span>
                      <span>Session initialized</span>
                    </motion.div>
                  )}
                  {welcomeStep >= 3 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <span className="text-green-400">✓</span>
                      <span>Terminal access granted</span>
                    </motion.div>
                  )}
                </div>
                {welcomeStep >= 4 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-yellow-300 text-center"
                  >
                    <div className="text-lg">Welcome to the Terminal</div>
                    <div className="text-sm mt-1">Have a nice day! 🚀</div>
                                         <div className="mt-3 text-gray-400 text-xs">
                       Auto-redirecting in 20 seconds...
                     </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col gap-8">
        {title ? (
          <TerminalTitle customTitle={title} customSubtitle={subtitle} />
        ) : (
          <TerminalTitle />
        )}
        <TerminalDisplayWidgets />
      </header>
      
      {!hideAuthPanel && (
        <section className="masterloginpanel mt-8 bg-transparent" aria-label="Authentication Panel">
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleSignInClick}
              className="inline-block border border-cyan-500 text-cyan-500 hover:text-yellow-400 hover:bg-cyan-500/10 transition-colors px-3 py-1 text-sm w-32"
              aria-label="Open sign in form"
            >
              {t('signIn')}
            </button>
            <button
              onClick={handleSignUpClick}
              className="inline-block border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-colors px-3 py-1 text-sm w-32"
              aria-label="Open create account form"
            >
              {t('signUp')}
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
                <div>{t('signIn')}</div>
                <label htmlFor="signin-email">{t('email')}:</label>
                <input 
                  type="email" 
                  id="signin-email" 
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="border-b border-cyan-500 text-cyan-500 bg-transparent" 
                  aria-label="Email address"
                  disabled={isAuthLoading}
                />
                <label htmlFor="signin-password">{t('password')}:</label>
                <input 
                  type="password" 
                  id="signin-password" 
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  onKeyPress={handleSignInKeyPress}
                  className="border-b border-cyan-500 text-cyan-500 bg-transparent" 
                  aria-label="Password"
                  disabled={isAuthLoading}
                />
                {isAuthLoading && <p>{t('signInLoading')}</p>}
                {authError && <p className="text-red-500">{authError}</p>}
                {successMessage && <p className="text-green-400">{successMessage}</p>}
                <div className="flex gap-3 mt-2">
                  <button 
                    className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 hover:text-yellow-400 transition-colors"
                    onClick={handleSignInSubmit}
                    aria-label="Submit sign in"
                    disabled={isAuthLoading}
                  >
                    {isAuthLoading ? t('signInLoading') : t('signIn')}
                  </button>
                  <button
                    type="button"
                    className="text-cyan-400 underline underline-offset-2 hover:text-yellow-400 transition-colors"
                    onClick={handleForgotPassword}
                    aria-label="Forgot password"
                    disabled={isAuthLoading}
                  >
                    {t('forgotPassword')}
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
                <div>{t('signUp')}</div>
                <label htmlFor="signup-email" className="text-yellow-400" style={{ color: '#FFD700' }}>{t('email')}:</label>
                <input 
                  type="email" 
                  id="signup-email" 
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="border-b border-yellow-400 text-yellow-400 bg-transparent" 
                  aria-label="Email address"
                  disabled={isAuthLoading}
                />
                <label htmlFor="signup-password" className="text-yellow-400" style={{ color: '#FFD700' }}>{t('password')}:</label>
                <input 
                  type="password" 
                  id="signup-password" 
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  onKeyPress={handleSignUpKeyPress}
                  className="border-b border-yellow-400 text-yellow-400 bg-transparent" 
                  aria-label="Password"
                  disabled={isAuthLoading}
                />
                {isAuthLoading && <p>{t('signUpLoading')}</p>}
                {authError && <p className="text-red-500">{authError}</p>}
                {successMessage && <p className="text-green-400">{successMessage}</p>}
                <button 
                  className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-colors mt-2"
                  onClick={handleSignUpSubmit}
                  aria-label="Submit create account"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? t('signUpLoading') : t('signUp')}
                </button>
                {showResendSignUp && (
                  <button 
                    onClick={handleResendSignUpVerification}
                    disabled={isAuthLoading}
                    className="w-full mt-2 bg-orange-600 text-white p-2 hover:bg-orange-500 transition-colors disabled:opacity-50 border border-orange-400"
                  >
                    {isAuthLoading ? t('resending') : t('resendVerification')}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Panel for Sign Up */}
          <AnimatePresence>
            {showSignUpSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 border border-green-400 text-green-300 p-4 bg-black/20 rounded"
              >
                <div className="text-green-300 mb-2 text-lg">{t('signUpSuccess')}</div>
                <div className="text-sm mb-4">
                  {t('signUpSuccessMessage')}
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {t('signUpSuccessResend')}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSignUpSuccess(false);
                      setShowSignIn(true);
                    }}
                    className="border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 transition-colors px-3 py-1 text-sm"
                  >
                    {t('goToSignIn')}
                  </button>
                  <button
                    onClick={() => setShowSignUpSuccess(false)}
                    className="text-gray-400 hover:text-white transition-colors px-3 py-1 text-sm"
                  >
                    {t('dismiss')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
                </section>
      )}

      {showEntryTerminal && (
        <section className="mt-8" aria-label="Entry Terminal">
          <EntryTerminal inputPlaceholder={t('typeEntry')} />
        </section>
      )}

      {children && (
        <div className="flex-1 mt-8">
          {children}
        </div>
      )}
    </main>
  );
}
