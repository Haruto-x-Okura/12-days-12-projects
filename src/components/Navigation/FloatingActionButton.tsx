/**
 * FloatingActionButton.tsx — FAB for quick data entry access
 *
 * Always visible floating button that opens the data entry panel
 * Animates on press with scale effect
 * Positioned to avoid mobile nav bar and respect safe areas
 */

import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  darkMode: boolean;
  isOpen: boolean;
}

export function FloatingActionButton({
  onClick,
  darkMode,
  isOpen,
}: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        fixed z-40
        right-4 bottom-20
        md:right-6 md:bottom-6
        md:hidden
        w-14 h-14 min-w-[56px] min-h-[56px]
        rounded-full
        flex items-center justify-center
        shadow-lg shadow-accent-indigo/30
        transition-colors
        ${isOpen
          ? 'bg-accent-red hover:bg-red-500'
          : 'bg-accent-indigo hover:bg-accent-indigo-hover'}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
        delay: 0.5,
      }}
      aria-label={isOpen ? 'Close data entry' : 'Open data entry'}
    >
      {isOpen ? (
        // Close icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      ) : (
        // Add/Edit icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )}
    </motion.button>
  );
}
