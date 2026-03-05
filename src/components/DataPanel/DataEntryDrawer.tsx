/**
 * DataEntryDrawer.tsx — Responsive data entry panel
 *
 * Mobile: Bottom sheet that slides up from bottom with drag-to-dismiss
 * Desktop: Side drawer that slides in from left
 * Uses Framer Motion for smooth spring physics animations
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation, type PanInfo } from 'framer-motion';
import { DataPanel } from './DataPanel';

interface RawRow {
  id: string;
  x: string;
  y: string;
}

interface DataEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rows: RawRow[];
  onRowsChange: (rows: RawRow[]) => void;
  onAddRow: () => void;
  darkMode: boolean;
}

// Spring transition configuration
const springTransition = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 300,
  mass: 0.8,
};

const exitTransition = {
  type: 'spring' as const,
  damping: 35,
  stiffness: 400,
};

export function DataEntryDrawer({
  isOpen,
  onClose,
  rows,
  onRowsChange,
  onAddRow,
  darkMode,
}: DataEntryDrawerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const controls = useAnimation();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Compute animation states based on mobile/desktop
  const initialState = useMemo(() => ({
    x: isMobile ? 0 : -320,
    y: isMobile ? '100%' : 0,
    opacity: 0,
  }), [isMobile]);

  const animateState = useMemo(() => ({
    x: 0,
    y: 0,
    opacity: 1,
  }), []);

  const exitState = useMemo(() => ({
    x: isMobile ? 0 : -320,
    y: isMobile ? '100%' : 0,
    opacity: 0,
  }), [isMobile]);

  // Handle drag end for bottom sheet dismiss
  const handleDragEnd = useCallback(
    async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isMobile) return;

      const threshold = 100; // px to drag before dismiss
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      // Dismiss if dragged down enough or with enough velocity
      if (offset > threshold || velocity > 500) {
        await controls.start({
          y: '100%',
          transition: { type: 'spring', damping: 25, stiffness: 300 },
        });
        onClose();
      } else {
        // Snap back to open
        controls.start({
          y: 0,
          transition: { type: 'spring', damping: 30, stiffness: 400 },
        });
      }
    },
    [isMobile, controls, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — only on mobile, clickable to close */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />

          {/* Drawer Container */}
          <motion.div
            className={`
              fixed z-50 overflow-hidden
              /* Mobile: Bottom sheet */
              bottom-0 left-0 right-0
              h-[85vh] max-h-[600px]
              rounded-t-2xl
              md:rounded-none md:rounded-r-2xl
              /* Desktop: Side drawer */
              md:bottom-auto md:top-[57px] md:left-0
              md:w-80 md:h-[calc(100vh-57px)] md:max-h-none
              /* Styling */
              ${darkMode ? 'bg-surface-card border-border-subtle' : 'bg-white border-gray-200'}
              shadow-2xl border-t md:border-t-0 md:border-r
            `}
            initial={initialState}
            animate={animateState}
            exit={exitState}
            transition={springTransition}
            drag={isMobile ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ touchAction: 'pan-x' }}
          >
            {/* Drag Handle — Mobile only */}
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1 pointer-events-none">
                <div
                  className={`
                    w-12 h-1.5 rounded-full
                    ${darkMode ? 'bg-border-subtle' : 'bg-gray-300'}
                  `}
                />
              </div>
            )}

            {/* Header with close button */}
            <div
              className={`
                flex items-center justify-between px-4 py-3
                border-b
                ${darkMode ? 'border-border-subtle' : 'border-gray-200'}
              `}
            >
              <h2
                className={`
                  text-base font-semibold
                  ${darkMode ? 'text-text-primary' : 'text-gray-900'}
                `}
              >
                Data Entry
              </h2>
              <button
                onClick={onClose}
                className={`
                  p-2 rounded-lg min-w-[44px] min-h-[44px]
                  flex items-center justify-center
                  transition-colors
                  ${darkMode
                    ? 'text-text-muted hover:text-text-primary hover:bg-surface-input'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                `}
                aria-label="Close data entry"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Data Panel Content */}
            <div className="flex-1 h-[calc(100%-60px)] overflow-hidden">
              <DataPanel
                rows={rows}
                onRowsChange={onRowsChange}
                onAddRow={onAddRow}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
