/**
 * GraphCanvas.tsx — The core graph rendering component with animations.
 *
 * Uses an HTML5 Canvas element to draw grid, axes, data points, and
 * regression lines. Features:
 * - Responsive sizing based on container
 * - Data points animate onto canvas when added (scale up + fade in)
 * - Slope line draws itself left to right when toggled on
 * - Handles DPR scaling for crisp rendering on hi-DPI displays
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { DataPoint, RegressionResult } from '../../utils/mathUtils';
import type { CanvasScale } from '../../utils/canvasUtils';
import {
  clearCanvas,
  drawGrid,
  drawAxes,
  drawAllPoints,
  drawBestFitLine,
  drawFirstDivisionLabels,
} from '../../utils/canvasUtils';

interface GraphCanvasProps {
  points: DataPoint[];
  scale: CanvasScale;
  regression: RegressionResult | null;
  showGrid: boolean;
  showBestFit: boolean;
  darkMode: boolean;
  xLabel?: string;
  yLabel?: string;
  xUnit?: string;
  yUnit?: string;
  /** Canvas width (auto-detected if not provided) */
  width?: number;
  /** Canvas height (auto-calculated if not provided) */
  height?: number;
}

// Animation constants for slope line drawing
const SLOPE_ANIMATION_DURATION = 800; // ms

export function GraphCanvas({
  points,
  scale,
  regression,
  showGrid,
  showBestFit,
  darkMode,
  xLabel = 'X',
  yLabel = 'Y',
  xUnit = '',
  yUnit = '',
  width: propWidth,
  height: propHeight,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [displayedPoints, setDisplayedPoints] = useState<DataPoint[]>([]);
  const [slopeProgress, setSlopeProgress] = useState(0);
  const prevShowBestFit = useRef(showBestFit);

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Mobile: use full width minus padding, maintain aspect ratio
        // Desktop: max out at reasonable size
        const maxWidth = Math.min(rect.width - 32, 800);
        const aspectRatio = 3 / 4; // height / width
        const height = Math.min(maxWidth * aspectRatio, window.innerHeight * 0.5);
        setCanvasSize({
          width: Math.max(maxWidth, 280),
          height: Math.max(height, 200),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Animate points appearing
  useEffect(() => {
    // Add new points with a stagger
    const newPoints = points.filter(
      (p) => !displayedPoints.some((dp) => dp.id === p.id)
    );

    if (newPoints.length > 0) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < newPoints.length) {
          setDisplayedPoints((prev) => [...prev, newPoints[index]]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // Remove points that no longer exist
    setDisplayedPoints((prev) => prev.filter((p) => points.some((np) => np.id === p.id)));
  }, [points]);

  // Animate slope line drawing
  useEffect(() => {
    if (showBestFit && !prevShowBestFit.current && regression) {
      // Starting animation
      setSlopeProgress(0);
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / SLOPE_ANIMATION_DURATION, 1);

        // Easing function (ease-out-cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        setSlopeProgress(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
    prevShowBestFit.current = showBestFit;
  }, [showBestFit, regression]);

  /** Full render pipeline */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = propWidth ?? canvasSize.width;
    const height = propHeight ?? canvasSize.height;

    if (width === 0 || height === 0) return;

    // Handle DPR for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 1. Clear
    clearCanvas(ctx, width, height, darkMode);

    // 2. Grid
    if (showGrid) {
      drawGrid(ctx, scale, darkMode);
    }

    // 3. Axes
    drawAxes(ctx, scale, darkMode, xLabel, yLabel);

    // 4. First division labels
    drawFirstDivisionLabels(ctx, scale, darkMode, xUnit, yUnit);

    // 5. Best-fit line with animation progress
    if (showBestFit && regression) {
      drawBestFitLine(
        ctx,
        regression.slope,
        regression.intercept,
        scale,
        {
          color: '#22d3ee',
          lineWidth: 2,
          progress: slopeProgress,
        },
        width,
        height
      );
    }

    // 6. Data points with animation (scale up effect handled in draw function)
    drawAllPoints(ctx, displayedPoints, scale, '#6366f1', 6, true);
  }, [
    canvasSize,
    propWidth,
    propHeight,
    displayedPoints,
    scale,
    regression,
    showGrid,
    showBestFit,
    darkMode,
    xLabel,
    yLabel,
    xUnit,
    yUnit,
    slopeProgress,
  ]);

  // Re-render on any dependency change
  useEffect(() => {
    render();
  }, [render]);

  const width = propWidth ?? canvasSize.width;
  const height = propHeight ?? canvasSize.height;

  return (
    <motion.div
      ref={containerRef}
      className="w-full flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring' as const,
        damping: 25,
        stiffness: 300,
        delay: 0.2,
      }}
    >
      <canvas
        ref={canvasRef}
        className={`
          rounded-lg max-w-full
          ${darkMode
            ? 'shadow-[0_0_40px_rgba(99,102,241,0.08)]'
            : 'shadow-lg border border-gray-200'}
        `}
        style={{ width, height }}
      />
    </motion.div>
  );
}
