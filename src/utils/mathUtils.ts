/**
 * mathUtils.ts — Core mathematical functions for the Lab Graph Plotter.
 *
 * Contains: least-squares regression, nice-scale computation for
 * human-readable axis ticks, and general numeric helpers.
 */

// ── Types ────────────────────────────────────────────────────

export interface DataPoint {
    id: string;
    x: number;
    y: number;
    /** ± uncertainty in X (for error bars) */
    dx?: number;
    /** ± uncertainty in Y (for error bars) */
    dy?: number;
    /** Whether this point is flagged as anomalous */
    anomalous?: boolean;
}

export interface RegressionResult {
    slope: number;
    intercept: number;
    rSquared: number;
}

export interface ScaleResult {
    niceMin: number;
    niceMax: number;
    tickSpacing: number;
}

// ── Least-Squares Linear Regression ──────────────────────────

/**
 * Computes the best-fit line y = mx + b using ordinary least squares.
 * Returns slope (m), intercept (b), and the coefficient of determination (R²).
 *
 * @param points Array of data points (only non-anomalous points are used)
 */
export function leastSquares(points: DataPoint[]): RegressionResult | null {
    const valid = points.filter(
        (p) => !p.anomalous && isFinite(p.x) && isFinite(p.y)
    );
    const n = valid.length;
    if (n < 2) return null;

    let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumX2 = 0,
        sumY2 = 0;

    for (const p of valid) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumX2 += p.x * p.x;
        sumY2 += p.y * p.y;
    }

    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-15) return null;

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    // R² = [n·Σxy − Σx·Σy]² / ([n·Σx² − (Σx)²] · [n·Σy² − (Σy)²])
    const ssNum = n * sumXY - sumX * sumY;
    const ssDenX = n * sumX2 - sumX * sumX;
    const ssDenY = n * sumY2 - sumY * sumY;
    const rSquared = ssDenY === 0 ? 1 : (ssNum * ssNum) / (ssDenX * ssDenY);

    return { slope, intercept, rSquared: Math.min(rSquared, 1) };
}

// ── Nice-Scale Algorithm ─────────────────────────────────────

/**
 * Attempt to pick a "nice" number close to `value`.
 * If `round` is true, we pick the nearest nice ceiling; otherwise the nearest floor.
 */
function niceNum(value: number, round: boolean): number {
    const exp = Math.floor(Math.log10(value));
    const frac = value / Math.pow(10, exp);

    let nice: number;
    if (round) {
        if (frac < 1.5) nice = 1;
        else if (frac < 3) nice = 2;
        else if (frac < 7) nice = 5;
        else nice = 10;
    } else {
        if (frac <= 1) nice = 1;
        else if (frac <= 2) nice = 2;
        else if (frac <= 5) nice = 5;
        else nice = 10;
    }
    return nice * Math.pow(10, exp);
}

/**
 * Produces human-readable axis bounds and tick spacing for a given data range.
 *
 * @param min Minimum data value
 * @param max Maximum data value
 * @param maxTicks Desired maximum number of tick marks (default 10)
 */
export function niceScale(
    min: number,
    max: number,
    maxTicks: number = 10
): ScaleResult {
    // Guard against flat range
    if (Math.abs(max - min) < 1e-15) {
        const pad = Math.abs(min) * 0.1 || 1;
        min -= pad;
        max += pad;
    }

    const range = niceNum(max - min, false);
    const tickSpacing = niceNum(range / (maxTicks - 1), true);
    const niceMin = Math.floor(min / tickSpacing) * tickSpacing;
    const niceMax = Math.ceil(max / tickSpacing) * tickSpacing;

    return { niceMin, niceMax, tickSpacing };
}

// ── Helpers ──────────────────────────────────────────────────

/** Generate a short random ID */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 10);
}

/** Clamp a value between min and max */
export function clamp(val: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, val));
}
