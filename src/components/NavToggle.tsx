import { motion } from 'framer-motion';

export default function NavToggle({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {

  return (
    <motion.div
      className={`absolute left-2 top-2 z-50 flex items-center justify-center`}
      initial={{ opacity: 0.7 }}
      animate={{
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ opacity: 1, scale: 1.1, color: 'gold' }} 
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        padding: '4px',
        width: '28px',
        height: '28px',
        color: 'rgba(34, 211, 238, 0.7)', 
      }}
    >
      <motion.div
        animate={{ rotate: isCollapsed ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: 'transparent', 
          border: '2px solid currentColor', 
        }}
      >
        {/* Circle is now a shape, no content needed */}
      </motion.div>
    </motion.div>
  );
}
