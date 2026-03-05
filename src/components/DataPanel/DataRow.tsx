/**
 * DataRow.tsx — A single row in the data input table with animations.
 *
 * Renders X and Y numeric inputs plus a delete button.
 * Features:
 * - Slide down + fade in when added
 * - Slide out + collapse before removal
 * - Scale up + fade in for data point animations (coordinated with canvas)
 * - Fast tabular data entry typical in physics labs
 */

import { memo, useCallback, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';

interface DataRowProps {
  index: number;
  x: string;
  y: string;
  onChange: (index: number, field: 'x' | 'y', value: string) => void;
  onDelete: (index: number) => void;
  /** Whether the delete button should be disabled (e.g. only 2 rows left) */
  canDelete: boolean;
  /** Whether this row is being removed (for exit animation) */
  isRemoving?: boolean;
}

/** Row entrance animation */
const rowVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 400,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export const DataRow = memo(function DataRow({
  index,
  x,
  y,
  onChange,
  onDelete,
  canDelete,
}: DataRowProps) {
  const handleX = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(index, 'x', e.target.value),
    [index, onChange]
  );

  const handleY = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(index, 'y', e.target.value),
    [index, onChange]
  );

  const handleDelete = useCallback(() => onDelete(index), [index, onDelete]);

  return (
    <motion.tr
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="group border-b border-border-subtle/50 transition-colors hover:bg-surface-input/40"
    >
      {/* Row number */}
      <td className="px-2 py-2 text-center text-xs text-text-muted font-mono w-8">
        {index + 1}
      </td>
      {/* X input */}
      <td className="px-1 py-1.5">
        <input
          type="number"
          step="any"
          value={x}
          onChange={handleX}
          placeholder="0"
          className="w-full min-h-[44px] bg-surface-input border border-border-subtle rounded-md px-2 py-2
                     text-sm font-mono text-text-primary placeholder:text-text-muted
                     focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus/30
                     transition-colors touch-manipulation"
          aria-label={`X value row ${index + 1}`}
          inputMode="decimal"
        />
      </td>
      {/* Y input */}
      <td className="px-1 py-1.5">
        <input
          type="number"
          step="any"
          value={y}
          onChange={handleY}
          placeholder="0"
          className="w-full min-h-[44px] bg-surface-input border border-border-subtle rounded-md px-2 py-2
                     text-sm font-mono text-text-primary placeholder:text-text-muted
                     focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus/30
                     transition-colors touch-manipulation"
          aria-label={`Y value row ${index + 1}`}
          inputMode="decimal"
        />
      </td>
      {/* Delete button */}
      <td className="px-1 py-1.5 text-center w-10">
        <button
          onClick={handleDelete}
          disabled={!canDelete}
          className="text-text-muted hover:text-accent-red disabled:opacity-20 disabled:cursor-not-allowed
                     transition-colors p-2 rounded min-w-[44px] min-h-[44px]
                     flex items-center justify-center touch-manipulation"
          aria-label={`Delete row ${index + 1}`}
          title="Delete row"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </td>
    </motion.tr>
  );
});
