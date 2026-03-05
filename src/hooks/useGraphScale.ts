/**
 * useGraphScale.ts — Computes axis ranges and tick spacing for the graph.
 *
 * Uses the niceScale algorithm to produce human-readable bounds that
 * neatly contain all data points with some padding.
 */

import { useMemo } from 'react';
import type { DataPoint } from '../utils/mathUtils';
import { niceScale } from '../utils/mathUtils';
import type { CanvasScale } from '../utils/canvasUtils';

/** Margins (px) around the plot area for axis labels */
const MARGINS = {
    top: 25,
    right: 25,
    bottom: 55,
    left: 65,
} as const;

interface UseGraphScaleOptions {
    points: DataPoint[];
    canvasWidth: number;
    canvasHeight: number;
}

/**
 * Computes the full canvas scale metadata needed for all drawing operations.
 * Automatically adapts axis bounds to fit data with nice round tick values.
 */
export function useGraphScale({
    points,
    canvasWidth,
    canvasHeight,
}: UseGraphScaleOptions): CanvasScale {
    return useMemo(() => {
        const validPoints = points.filter(
            (p) => isFinite(p.x) && isFinite(p.y)
        );

        let dataXMin = 0,
            dataXMax = 10,
            dataYMin = 0,
            dataYMax = 10;

        if (validPoints.length > 0) {
            dataXMin = Math.min(...validPoints.map((p) => p.x));
            dataXMax = Math.max(...validPoints.map((p) => p.x));
            dataYMin = Math.min(...validPoints.map((p) => p.y));
            dataYMax = Math.max(...validPoints.map((p) => p.y));

            // Add 5% padding so points don't sit on the axis
            const xPad = (dataXMax - dataXMin) * 0.05 || 1;
            const yPad = (dataYMax - dataYMin) * 0.05 || 1;
            dataXMin -= xPad;
            dataXMax += xPad;
            dataYMin -= yPad;
            dataYMax += yPad;
        }

        const xScale = niceScale(dataXMin, dataXMax, 8);
        const yScale = niceScale(dataYMin, dataYMax, 8);

        return {
            xMin: xScale.niceMin,
            xMax: xScale.niceMax,
            yMin: yScale.niceMin,
            yMax: yScale.niceMax,
            xTickSpacing: xScale.tickSpacing,
            yTickSpacing: yScale.tickSpacing,
            plotLeft: MARGINS.left,
            plotTop: MARGINS.top,
            plotWidth: canvasWidth - MARGINS.left - MARGINS.right,
            plotHeight: canvasHeight - MARGINS.top - MARGINS.bottom,
        };
    }, [points, canvasWidth, canvasHeight]);
}
