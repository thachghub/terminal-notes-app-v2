import { motion } from 'framer-motion';

export default function NavToggle({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {

  const circleStyles = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '2px solid currentColor',
  };

  const lineStyles = {
    width: '16px',
    height: '2px',
    borderRadius: '1px',
    backgroundColor: 'currentColor', // CHANGED: Back to theme color
    border: 'none',
  };

  // Styles for the outer clickable container
  const expandedContainerStyles = {
    width: '28px',
    height: '28px',
    padding: '4px',
  };

  const collapsedContainerStyles = {
    width: '24px', // 16px line + 4px horizontal padding on each side
    height: '6px',  // 2px line + 2px vertical padding on each side
    padding: '0px', // Padding is effectively part of width/height, flex will center
  };

  return (
    <motion.div
      className={`absolute left-2 top-2 z-50 flex items-center justify-center`}
      initial={false} // Let animate define initial based on isCollapsed
      animate={{
        ...(isCollapsed ? collapsedContainerStyles : expandedContainerStyles),
        opacity: [0.7, 1, 0.7], // Pulse opacity always
      }}
      transition={{
        // Default transition for size/padding changes
        default: { duration: 0.3, ease: 'easeInOut' },
        // Specific transition for opacity pulse
        opacity: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }, // Delay pulse slightly after size change
      }}
      whileHover={{ 
        scale: isCollapsed ? 1 : 1.1, // No scale change for line, scale up for circle
        color: 'gold',                 // Always change color to gold on hover
        opacity: 1,                    // Always bring opacity to 1 on hover
      }}
      whileTap={{ scale: isCollapsed ? 1 : 0.95 }} // No extra tap scale down if already small
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        color: 'rgba(34, 211, 238, 0.7)', 
        // overflow: 'hidden', // Add if child shape pokes out during transition
      }}
    >
      <motion.div
        initial={false}
        animate={{
          ...(isCollapsed ? lineStyles : circleStyles),
          rotate: isCollapsed ? 180 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Shape is now fully styled by animation props */}
      </motion.div>
    </motion.div>
  );
}
