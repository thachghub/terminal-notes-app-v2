"use client";

import { useState, useEffect, useRef } from "react";
import { signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { emailVerificationSettings } from "../../firebase/config";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';

// Sparkle component for title animation
function Sparkle({ width, height }: { width: number; height: number }) {
  // Generate a random horizontal position and delay for each sparkle
  const left = Math.random() * width;
  const delay = Math.random() * 2;
  const duration = 2.5 + Math.random();
  return (
    <motion.div
      initial={{ y: -20, opacity: 1 }}
      animate={{ y: height + 20, opacity: 0 }}
      transition={{ delay, duration, repeat: Infinity, repeatType: 'loop' }}
      style={{ position: 'absolute', left, top: 0, pointerEvents: 'none' }}
    >
      {/* SVG sparkle/star */}
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2 L13.09 8.26 L19 9.27 L14.5 13.14 L15.82 19.02 L12 16 L8.18 19.02 L9.5 13.14 L5 9.27 L10.91 8.26 Z" fill="#67e8f9"/>
      </svg>
    </motion.div>
  );
}

// TerminalTitle component for login page
function LoginTerminalTitle() {
  const [typingKey, setTypingKey] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTypingKey(prev => prev + 1);
    }, 5000); // 5 seconds for typing effect
    return () => clearInterval(intervalId);
  }, []);

  // Update dimensions on mount and resize
  useEffect(() => {
    function update() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Effect to re-trigger text animation every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setAnimationKey(prevKey => prevKey + 1);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  const title = 'HYPER TERMINAL';
  const subtitle = '// authenticate access';

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: 'fit-content' }} className="mb-8">
      {/* Sparkles overlay */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: dimensions.width, height: dimensions.height, pointerEvents: 'none', zIndex: 2 }}>
        {/* Render 8 sparkles for a lively effect */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Sparkle key={i} width={dimensions.width} height={dimensions.height} />
        ))}
      </div>
      {/* Title letters */}
      <div className="relative flex flex-col items-center mb-2" style={{ minHeight: 48 }}>
        <h1
          ref={containerRef}
          className="text-cyan-400 text-6xl mb-4 font-[VT323] tracking-tight relative z-[1]"
          style={{ position: 'relative' }}
        >
          {title.split('').map((char, idx) => (
            <motion.span
              key={`${idx}-${animationKey}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
        <span className="text-cyan-400 text-sm font-mono mt-1 opacity-80">
          {subtitle}
          {[0, 1, 2].map(dotIdx => (
            <motion.span
              key={`dot-${dotIdx}-${typingKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + dotIdx * 0.3 }}
              style={{ display: 'inline-block' }}
            >
              .
            </motion.span>
          ))}
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const router = useRouter();

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
      }, 75); // 75ms timing between characters

      return () => clearInterval(typeInterval);
    }
  }, [currentWelcomeMessage, welcomeStep]);

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
    router.push("/userdashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setShowResend(false);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await signOut(auth);
        setError("Please verify your email before logging in.");
        setShowResend(true);
        return;
      }
      setSuccess(true);
      
      // Show welcome message
      setTimeout(() => {
        setSuccess(false);
        setCurrentWelcomeMessage(getRandomWelcomeMessage());
        setShowWelcome(true);
        setWelcomeStep(0);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setInfo("");
    setIsLoading(true);

    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser, emailVerificationSettings);
        setInfo("Verification email resent.");
      } catch (err: any) {
        setError("Failed to resend verification email: " + err.message);
      }
    } else {
      setError("No user is currently signed in.");
    }
    setIsLoading(false);
  };

  const goToSignup = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono p-8" 
         style={{
           background: 'linear-gradient(135deg, #0f2124 0%, #062c33 50%, #0f2124 100%)'
         }}>
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

      <div className="max-w-md mx-auto">
        <LoginTerminalTitle />
        
        <h2 className="text-xl mb-6 text-cyan-300 text-center">$ login --user</h2>
        
        <div className="relative">
          {/* Main form panel */}
          <div className="relative border border-cyan-400/60 p-6"
               style={{
                 backgroundColor: '#062c33'
               }}>
            
            <form onSubmit={handleLogin} className="space-y-4 relative">
              <div>
                <label className="block text-sm mb-1 text-cyan-300">Email:</label>
                <input
                  type="email"
                  placeholder="user@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full border border-cyan-400/60 text-cyan-300 p-2 focus:outline-none focus:border-cyan-300 focus:bg-black disabled:opacity-50 placeholder-cyan-500/50 transition-all duration-200"
                  style={{
                    backgroundColor: '#062c33'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1 text-cyan-300">Password:</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full border border-cyan-400/60 text-cyan-300 p-2 focus:outline-none focus:border-cyan-300 focus:bg-black disabled:opacity-50 placeholder-cyan-500/50 transition-all duration-200"
                  style={{
                    backgroundColor: '#062c33'
                  }}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-cyan-400/10 border border-cyan-400 text-cyan-300 p-2 hover:bg-cyan-400/20 hover:text-cyan-100 hover:border-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              >
                {isLoading ? "Logging In..." : "Log In"}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="border border-red-400/80 text-red-300 p-3 mt-4"
               style={{
                 backgroundColor: '#062c33'
               }}>
            <div className="text-red-300 mb-1 font-bold">✗ Error</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {info && (
          <div className="border border-cyan-400/80 text-cyan-300 p-3 mt-4"
               style={{
                 backgroundColor: '#062c33'
               }}>
            <div className="text-cyan-300 mb-1 font-bold">ℹ Info</div>
            <div className="text-sm">{info}</div>
          </div>
        )}

        {success && (
          <div className="border border-green-400/80 text-green-300 p-3 mt-4"
               style={{
                 backgroundColor: '#062c33'
               }}>
            <div className="text-green-300 mb-1 font-bold">✓ Success</div>
            <div className="text-sm">Login successful! Redirecting...</div>
          </div>
        )}

        {showResend && (
          <button 
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full mt-4 bg-yellow-600/20 border border-yellow-400 text-yellow-300 p-2 hover:bg-yellow-600/30 hover:border-yellow-300 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Resending..." : "Resend Verification Email"}
          </button>
        )}

        <div className="mt-6 text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <button 
            onClick={goToSignup}
            className="text-cyan-400 hover:text-cyan-300 underline hover:no-underline transition-all duration-200"
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
}
