/**
 * ScaleInfo.tsx — Physics lab style scale display
 *
 * Shows axis scale information in a clean, lab-report format:
 *   X-axis: 1 div = [value] [unit]
 *   Y-axis: 1 div = [value] [unit]
 *
 * Features:
 * - Staggered entrance animation on first render
 * - Wraps cleanly on small screens
 * - Uses nice round numbers (1, 2, 5, 10, 0.5, 0.1)
 * - First division labeled on graph (handled by canvas)
 * - Updates live as data changes
 */

import { motion } from 'framer-motion';
import type { CanvasScale } from '../../utils/canvasUtils';

interface ScaleInfoProps {
  scale: CanvasScale;
  xUnit?: string;
  yUnit?: string;
  darkMode?: boolean;
}

/** Container animation for staggered children */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

/** Individual chip animation */
const chipVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 300,
    },
  },
};

/** Format scale value to nice round number */
function formatScaleValue(value: number): string {
  // Handle very small numbers
  if (Math.abs(value) < 0.001 && value !== 0) {
    return value.toExponential(1);
  }
  // Handle large numbers
  if (Math.abs(value) >= 10000) {
    return value.toExponential(1);
  }
  // For regular numbers, show appropriate precision
  if (Math.abs(value) >= 1) {
    return parseFloat(value.toPrecision(3)).toString();
  }
  // For small decimals
  return parseFloat(value.toPrecision(2)).toString();
}

export function ScaleInfo({
  scale,
  xUnit = 'units',
  yUnit = 'units',
  darkMode = true,
}: ScaleInfoProps) {
  const xDivValue = formatScaleValue(scale.xTickSpacing);
  const yDivValue = formatScaleValue(scale.yTickSpacing);

  return (
    <motion.div
      className="w-full px-4 py-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        className={`
          flex flex-wrap items-center justify-center gap-2 md:gap-4
          text-xs md:text-sm
          ${darkMode ? 'text-text-muted' : 'text-gray-600'}
        `}
      >
        {/* X-axis scale chip */}
        <motion.div
          variants={chipVariants}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full
            border
            ${darkMode
              ? 'bg-surface-input/50 border-border-subtle/50'
              : 'bg-gray-50 border-gray-200'}
          `}
        >
          <span className="font-medium text-accent-indigo">X-axis:</span>
          <span className="font-mono">1 div = {xDivValue} {xUnit}</span>
          <span
            className={`
              hidden sm:inline text-[10px]
              ${darkMode ? 'text-text-muted/60' : 'text-gray-400'}
            `}
          >
            ({formatScaleValue(scale.xMin)} → {formatScaleValue(scale.xMax)})
          </span>
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={chipVariants}
          className={`
            hidden md:block w-px h-4
            ${darkMode ? 'bg-border-subtle' : 'bg-gray-300'}
          `}
        />

        {/* Y-axis scale chip */}
        <motion.div
          variants={chipVariants}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full
            border
            ${darkMode
              ? 'bg-surface-input/50 border-border-subtle/50'
              : 'bg-gray-50 border-gray-200'}
          `}
        >
          <span className="font-medium text-accent-cyan">Y-axis:</span>
          <span className="font-mono">1 div = {yDivValue} {yUnit}</span>
          <span
            className={`
              hidden sm:inline text-[10px]
              ${darkMode ? 'text-text-muted/60' : 'text-gray-400'}
            `}
          >
            ({formatScaleValue(scale.yMin)} → {formatScaleValue(scale.yMax)})
          </span>
        </motion.div>
      </div>

      {/* Lab legend style note */}
      <motion.p
        variants={chipVariants}
        className={`
          text-center text-[10px] mt-2
          ${darkMode ? 'text-text-muted/50' : 'text-gray-400'}
        `}
      >
        Scale updates automatically based on data range
      </motion.p>
    </motion.div>
  );
}
