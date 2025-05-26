import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function NavToggle({ isCollapsed, onToggle, position = 'left' }: { isCollapsed: boolean; onToggle: () => void; position?: 'left' | 'right' }) {
  const positionClasses = position === 'left' ? 'fixed left-2' : 'fixed right-2';

  return (
    <motion.div
      className={`absolute ${position === 'left' ? 'left-2' : 'right-2'} top-2 z-50`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#0f2124',
        border: '1px solid rgba(34, 211, 238, 0.2)',
        backdropFilter: 'blur(4px)',
        position: 'absolute'
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0) 70%)',
        }}
      />
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="w-6 h-6"
          style={{
            background: 'linear-gradient(45deg, rgba(34, 211, 238, 0.8), rgba(34, 211, 238, 0.4))',
            borderRadius: '4px',
          }}
          animate={{
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
