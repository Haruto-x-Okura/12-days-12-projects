/**
 * useRegression.ts — Computes linear regression on the active data set.
 *
 * Memoizes the result so the canvas and slope-info panel share the
 * same computation without redundant recalculations.
 */

import { useMemo } from 'react';
import type { DataPoint, RegressionResult } from '../utils/mathUtils';
import { leastSquares } from '../utils/mathUtils';

/**
 * Returns the OLS regression result (slope, intercept, R²) or null
 * if fewer than 2 valid (non-anomalous) points exist.
 */
export function useRegression(points: DataPoint[]): RegressionResult | null {
    return useMemo(() => leastSquares(points), [points]);
}
