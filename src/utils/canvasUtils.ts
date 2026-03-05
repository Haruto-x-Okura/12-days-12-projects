/**
 * canvasUtils.ts — All Canvas 2D drawing helpers for the Lab Graph Plotter.
 *
 * Every function here is a pure drawing operation — it takes a CanvasRenderingContext2D,
 * coordinate/scale metadata, and draws directly. No React state is touched.
 */

import type { DataPoint } from './mathUtils';

// ── Types ────────────────────────────────────────────────────

/** Describes how data-space maps onto canvas pixels. */
export interface CanvasScale {
    /** Data-space bounds */
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    /** Pixel region of the plot area (inside axis labels) */
    plotLeft: number;
    plotTop: number;
    plotWidth: number;
    plotHeight: number;
    /** Tick spacing in data-space units */
    xTickSpacing: number;
    yTickSpacing: number;
}

export interface DrawOptions {
    showGrid: boolean;
    showBestFit: boolean;
    darkMode: boolean;
    graphPaperMode: boolean;
}

// ── Coordinate Mapping ───────────────────────────────────────

/** Convert a data-space point to canvas pixel coordinates. */
export function mapToCanvas(
    dataX: number,
    dataY: number,
    scale: CanvasScale
): { cx: number; cy: number } {
    const cx =
        scale.plotLeft +
        ((dataX - scale.xMin) / (scale.xMax - scale.xMin)) * scale.plotWidth;
    // Canvas Y is inverted (0 at top)
    const cy =
        scale.plotTop +
        ((scale.yMax - dataY) / (scale.yMax - scale.yMin)) * scale.plotHeight;
    return { cx, cy };
}

// ── Grid & Axes ──────────────────────────────────────────────

/** Draw the background grid lines */
export function drawGrid(
    ctx: CanvasRenderingContext2D,
    scale: CanvasScale,
    darkMode: boolean
): void {
    ctx.save();
    ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;

    // Vertical grid lines
    const xStart = Math.ceil(scale.xMin / scale.xTickSpacing) * scale.xTickSpacing;
    for (let x = xStart; x <= scale.xMax + 1e-9; x += scale.xTickSpacing) {
        const { cx } = mapToCanvas(x, 0, scale);
        ctx.beginPath();
        ctx.moveTo(Math.round(cx) + 0.5, scale.plotTop);
        ctx.lineTo(Math.round(cx) + 0.5, scale.plotTop + scale.plotHeight);
        ctx.stroke();
    }

    // Horizontal grid lines
    const yStart = Math.ceil(scale.yMin / scale.yTickSpacing) * scale.yTickSpacing;
    for (let y = yStart; y <= scale.yMax + 1e-9; y += scale.yTickSpacing) {
        const { cy } = mapToCanvas(0, y, scale);
        ctx.beginPath();
        ctx.moveTo(scale.plotLeft, Math.round(cy) + 0.5);
        ctx.lineTo(scale.plotLeft + scale.plotWidth, Math.round(cy) + 0.5);
        ctx.stroke();
    }

    ctx.restore();
}

/** Draw X and Y axes with tick marks and labels */
export function drawAxes(
    ctx: CanvasRenderingContext2D,
    scale: CanvasScale,
    darkMode: boolean,
    xLabel: string = 'X',
    yLabel: string = 'Y'
): void {
    ctx.save();
    const textColor = darkMode ? '#94a3b8' : '#475569';
    const axisColor = darkMode ? '#475569' : '#94a3b8';

    // Axis lines
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;

    // X axis (bottom of plot)
    ctx.beginPath();
    ctx.moveTo(scale.plotLeft, scale.plotTop + scale.plotHeight);
    ctx.lineTo(scale.plotLeft + scale.plotWidth, scale.plotTop + scale.plotHeight);
    ctx.stroke();

    // Y axis (left of plot)
    ctx.beginPath();
    ctx.moveTo(scale.plotLeft, scale.plotTop);
    ctx.lineTo(scale.plotLeft, scale.plotTop + scale.plotHeight);
    ctx.stroke();

    // Tick marks and labels
    ctx.fillStyle = textColor;
    ctx.font = '11px "Inter", system-ui, sans-serif';

    // X ticks
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xStart = Math.ceil(scale.xMin / scale.xTickSpacing) * scale.xTickSpacing;
    for (let x = xStart; x <= scale.xMax + 1e-9; x += scale.xTickSpacing) {
        const { cx } = mapToCanvas(x, 0, scale);
        // Tick mark
        ctx.beginPath();
        ctx.moveTo(cx, scale.plotTop + scale.plotHeight);
        ctx.lineTo(cx, scale.plotTop + scale.plotHeight + 5);
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        // Label
        ctx.fillText(formatTickLabel(x), cx, scale.plotTop + scale.plotHeight + 8);
    }

    // Y ticks
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yStart = Math.ceil(scale.yMin / scale.yTickSpacing) * scale.yTickSpacing;
    for (let y = yStart; y <= scale.yMax + 1e-9; y += scale.yTickSpacing) {
        const { cy } = mapToCanvas(0, y, scale);
        ctx.beginPath();
        ctx.moveTo(scale.plotLeft - 5, cy);
        ctx.lineTo(scale.plotLeft, cy);
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillText(formatTickLabel(y), scale.plotLeft - 8, cy);
    }

    // Axis labels
    ctx.fillStyle = darkMode ? '#e2e8f0' : '#1e293b';
    ctx.font = '13px "Inter", system-ui, sans-serif';

    // X label (centered below ticks)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(
        xLabel,
        scale.plotLeft + scale.plotWidth / 2,
        scale.plotTop + scale.plotHeight + 28
    );

    // Y label (rotated, centered left of ticks)
    ctx.save();
    ctx.translate(16, scale.plotTop + scale.plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    ctx.restore();
}

// ── Data Points ──────────────────────────────────────────────

/** Draw a single data point as a filled circle */
export function drawPoint(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    options: {
        color?: string;
        radius?: number;
        anomalous?: boolean;
    } = {}
): void {
    const { color = '#6366f1', radius = 4, anomalous = false } = options;
    ctx.save();

    if (anomalous) {
        // Hollow circle with X through it for anomalous points
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
        ctx.stroke();
        // Small X
        const d = radius + 1;
        ctx.beginPath();
        ctx.moveTo(cx - d, cy - d);
        ctx.lineTo(cx + d, cy + d);
        ctx.moveTo(cx + d, cy - d);
        ctx.lineTo(cx - d, cy + d);
        ctx.stroke();
    } else {
        // Filled circle with subtle glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // White inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Border for visibility
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

/** Draw all data points with optional animation */
export function drawAllPoints(
    ctx: CanvasRenderingContext2D,
    points: DataPoint[],
    scale: CanvasScale,
    color: string = '#6366f1',
    radius: number = 4,
    animate: boolean = false
): void {
    for (const p of points) {
        if (!isFinite(p.x) || !isFinite(p.y)) continue;
        const { cx, cy } = mapToCanvas(p.x, p.y, scale);
        // Only draw if within plot area (with small margin)
        if (
            cx >= scale.plotLeft - 10 &&
            cx <= scale.plotLeft + scale.plotWidth + 10 &&
            cy >= scale.plotTop - 10 &&
            cy <= scale.plotTop + scale.plotHeight + 10
        ) {
            drawPoint(ctx, cx, cy, { color, radius, anomalous: p.anomalous });
        }
    }
}

// ── Best-Fit Line ────────────────────────────────────────────

/** Draw a regression line across the full plot width with animation support */
export function drawBestFitLine(
    ctx: CanvasRenderingContext2D,
    slope: number,
    intercept: number,
    scale: CanvasScale,
    options: {
        color?: string;
        lineWidth?: number;
        dashed?: boolean;
        progress?: number; // 0-1 for animation
    } = {},
    canvasWidth: number = 0,
    canvasHeight: number = 0
): void {
    const {
        color = '#22d3ee',
        lineWidth = 2,
        dashed = false,
        progress = 1,
    } = options;

    // Calculate y at xMin and xMax
    const y1 = slope * scale.xMin + intercept;
    const y2 = slope * scale.xMax + intercept;

    const start = mapToCanvas(scale.xMin, y1, scale);
    const end = mapToCanvas(scale.xMax, y2, scale);

    ctx.save();

    // Clip to plot area
    ctx.beginPath();
    ctx.rect(scale.plotLeft, scale.plotTop, scale.plotWidth, scale.plotHeight);
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    if (dashed) ctx.setLineDash([6, 4]);

    // Calculate intermediate point based on progress
    const currentX = start.cx + (end.cx - start.cx) * progress;
    const currentY = start.cy + (end.cy - start.cy) * progress;

    // Draw glow effect behind the line
    if (progress > 0) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = lineWidth + 4;
        ctx.beginPath();
        ctx.moveTo(start.cx, start.cy);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        ctx.restore();
    }

    // Draw the actual line
    ctx.beginPath();
    ctx.moveTo(start.cx, start.cy);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    ctx.restore();
}

// ── First Division Labels ───────────────────────────────────

/** Draw labels for the first division on each axis (physics lab style) */
export function drawFirstDivisionLabels(
    ctx: CanvasRenderingContext2D,
    scale: CanvasScale,
    darkMode: boolean,
    xUnit: string = '',
    yUnit: string = ''
): void {
    const textColor = darkMode ? '#94a3b8' : '#475569';
    const accentColor = darkMode ? '#6366f1' : '#4f46e5';

    ctx.save();
    ctx.font = 'bold 10px "Inter", system-ui, sans-serif';

    // X-axis first division
    const xFirstTick = Math.ceil(scale.xMin / scale.xTickSpacing) * scale.xTickSpacing;
    if (xFirstTick <= scale.xMax) {
        const { cx } = mapToCanvas(xFirstTick, 0, scale);
        ctx.fillStyle = accentColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(
            `${xFirstTick}${xUnit ? ' ' + xUnit : ''}`,
            cx,
            scale.plotTop + scale.plotHeight - 15
        );
    }

    // Y-axis first division
    const yFirstTick = Math.ceil(scale.yMin / scale.yTickSpacing) * scale.yTickSpacing;
    if (yFirstTick <= scale.yMax) {
        const { cy } = mapToCanvas(0, yFirstTick, scale);
        ctx.fillStyle = accentColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            `${yFirstTick}${yUnit ? ' ' + yUnit : ''}`,
            scale.plotLeft + 8,
            cy
        );
    }

    ctx.restore();
}

// ── Full Render Pipeline ─────────────────────────────────────

/** Clear the entire canvas and fill with background */
export function clearCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    darkMode: boolean
): void {
    ctx.fillStyle = darkMode ? '#0f1117' : '#ffffff';
    ctx.fillRect(0, 0, width, height);
}

// ── Helpers ──────────────────────────────────────────────────

/** Format a tick value for display (avoid floating-point noise) */
function formatTickLabel(value: number): string {
    if (Math.abs(value) < 1e-10) return '0';
    const abs = Math.abs(value);
    if (abs >= 1e6 || (abs < 0.01 && abs !== 0)) {
        return value.toExponential(1);
    }
    // Remove floating-point rounding artifacts
    const s = value.toPrecision(6);
    return parseFloat(s).toString();
}
