import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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
        <path d="M12 2 L13.09 8.26 L19 9.27 L14.5 13.14 L15.82 19.02 L12 16 L8.18 19.02 L9.5 13.14 L5 9.27 L10.91 8.26 Z" fill="#fff"/>
      </svg>
    </motion.div>
  );
}

export default function TerminalTitle({ customTitle, customSubtitle }: { customTitle?: string; customSubtitle?: string }) {
  const [typingKey, setTypingKey] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTypingKey(prev => prev + 1);
    }, 5000); // 5 seconds for typing effect
    return () => clearInterval(intervalId);
  }, []);
  const title = customTitle || 'HYPER TERMINAL';
  const subtitle = customSubtitle || '// sending transmission';
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [animationKey, setAnimationKey] = useState(0); // State to trigger re-animation

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

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: 'fit-content' }}>
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
              key={`${idx}-${animationKey}`} // Use animationKey in the key
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
              transition={{ delay: 1 + dotIdx * 0.3 }} // slower dots appear one by one
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
