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

  // Random welcome messages
  const welcomeMessages = [
    "Your presence is now logged.",
    "Awaiting your first entry...",
    "All signals are clear. Begin transmission.",
    "The void listens.",
    "Now entering... resonance mode.",
    "What will echo today?",
    "A thought placed is never lost.",
    "Leave a trace, not a noise.",
    "You never know which word matters most."
  ];

  // Get random welcome message
  const getRandomWelcomeMessage = () => {
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  };

  // State for current welcome message
  const [currentWelcomeMessage, setCurrentWelcomeMessage] = useState('');
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect for welcome message
  useEffect(() => {
    if (currentWelcomeMessage && welcomeStep >= 4 && !isTyping) {
      setIsTyping(true);
      setDisplayedMessage('');
      
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < currentWelcomeMessage.length) {
          setDisplayedMessage(currentWelcomeMessage.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 75); // Slowed down from 50ms to 75ms (50% slower)

      return () => clearInterval(typeInterval);
    }
  }, [currentWelcomeMessage, welcomeStep]);

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
        setCurrentWelcomeMessage(getRandomWelcomeMessage());
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
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            aria-label="Welcome Message"
          >
            <div className="relative">
              {/* Cyber glow effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-green-400/20 to-cyan-500/20 rounded-lg blur-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-400/5 to-transparent rounded-lg"></div>
              
              {/* Main terminal panel */}
              <div className="relative border-2 border-cyan-400/80 bg-black/95 backdrop-blur-md p-6 rounded-lg shadow-2xl shadow-cyan-400/25" 
                   style={{
                     background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(6,44,51,0.95) 50%, rgba(0,0,0,0.95) 100%)',
                     boxShadow: '0 0 30px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.1)'
                   }}>
                
                {/* Terminal scan lines effect */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="h-full w-full bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent" 
                       style={{
                         backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 211, 238, 0.1) 2px, rgba(34, 211, 238, 0.1) 4px)',
                       }}></div>
                </div>

                <div className="relative space-y-3 font-mono">
                  {/* Header with enhanced cyber styling */}
                  <div className="flex justify-between items-center pb-3">
                    <motion.div 
                      className="text-cyan-400 text-lg font-bold tracking-wider"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        textShadow: '0 0 10px rgba(34, 211, 238, 0.8), 0 0 20px rgba(34, 211, 238, 0.4)'
                      }}
                    >
                      $ system --welcome
                    </motion.div>
                    <button
                      onClick={handleCloseWelcome}
                      className="text-gray-400 hover:text-cyan-400 transition-all duration-300 px-3 py-1 text-sm border border-gray-600 hover:border-cyan-400/60 rounded bg-gray-900/50 hover:bg-cyan-400/10 hover:shadow-lg hover:shadow-cyan-400/20"
                      aria-label="Close welcome message"
                      style={{
                        textShadow: '0 0 5px rgba(156, 163, 175, 0.5)'
                      }}
                    >
                      close
                    </button>
                  </div>

                  {/* Status messages with enhanced effects */}
                  <div className="text-cyan-300 space-y-2">
                    {welcomeStep >= 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 group"
                      >
                        <motion.span 
                          className="text-green-400 font-bold text-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          style={{
                            textShadow: '0 0 15px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.4)'
                          }}
                        >
                          ✓
                        </motion.span>
                        <span className="tracking-wide" style={{
                          textShadow: '0 0 8px rgba(103, 232, 249, 0.6)'
                        }}>
                          Authentication successful
                        </span>
                      </motion.div>
                    )}
                    {welcomeStep >= 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 group"
                      >
                        <motion.span 
                          className="text-green-400 font-bold text-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                          style={{
                            textShadow: '0 0 15px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.4)'
                          }}
                        >
                          ✓
                        </motion.span>
                        <span className="tracking-wide" style={{
                          textShadow: '0 0 8px rgba(103, 232, 249, 0.6)'
                        }}>
                          Session initialized
                        </span>
                      </motion.div>
                    )}
                    {welcomeStep >= 3 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-3 group"
                      >
                        <motion.span 
                          className="text-green-400 font-bold text-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                          style={{
                            textShadow: '0 0 15px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.4)'
                          }}
                        >
                          ✓
                        </motion.span>
                        <span className="tracking-wide" style={{
                          textShadow: '0 0 8px rgba(103, 232, 249, 0.6)'
                        }}>
                          Terminal access granted
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Welcome message with enhanced cyber styling */}
                  {welcomeStep >= 4 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                      className="mt-6 pt-4"
                    >
                      <motion.div 
                        className="text-xl font-bold tracking-wider mb-2"
                        style={{
                          background: 'linear-gradient(45deg, #fde047, #22d3ee, #fde047)',
                          backgroundSize: '200% 200%',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          textShadow: '0 0 20px rgba(253, 224, 71, 0.5)'
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        Welcome to the Hyper Skye Terminal
                      </motion.div>
                      <motion.div 
                        className="text-sm text-cyan-300 mb-4 tracking-wide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        style={{
                          textShadow: '0 0 10px rgba(103, 232, 249, 0.6)'
                        }}
                      >
                        {displayedMessage}
                        {isTyping && (
                          <motion.span
                            className="text-cyan-400"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            style={{
                              textShadow: '0 0 10px rgba(34, 211, 238, 0.8)'
                            }}
                          >
                            _
                          </motion.span>
                        )}
                      </motion.div>
                      <motion.div 
                        className="text-gray-400 text-xs tracking-wider"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
                        style={{
                          textShadow: '0 0 5px rgba(156, 163, 175, 0.5)'
                        }}
                      >
                        Auto-redirecting in 20 seconds...
                      </motion.div>
                    </motion.div>
                  )}
                </div>
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
                    className="border border-cyan-400 text-cyan-300 font-mono px-3 py-1 text-sm bg-transparent hover:bg-cyan-400/10 hover:text-yellow-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all shadow-cyan-400/10 shadow"
                  >
                    {t('goToSignIn')}
                  </button>
                  <button
                    onClick={() => setShowSignUpSuccess(false)}
                    className="border border-gray-500 text-gray-400 font-mono px-3 py-1 text-sm bg-transparent hover:bg-gray-700/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all shadow"
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
