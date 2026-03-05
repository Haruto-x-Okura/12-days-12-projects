/**
 * SlopeInfo.tsx — Displays regression statistics: slope, intercept, R².
 *
 * Uses conditional coloring on R² to give instant feedback on fit quality:
 *   ● Green:  R² ≥ 0.99  (excellent)
 *   ● Cyan:   R² ≥ 0.95  (good)
 *   ● Amber:  R² ≥ 0.90  (acceptable)
 *   ● Red:    R² < 0.90  (poor)
 */

import type { RegressionResult } from '../../utils/mathUtils';

interface SlopeInfoProps {
  regression: RegressionResult | null;
}

/** Get the R² quality color class */
function rSquaredColor(r2: number): string {
  if (r2 >= 0.99) return 'text-accent-green';
  if (r2 >= 0.95) return 'text-accent-cyan';
  if (r2 >= 0.9) return 'text-accent-amber';
  return 'text-accent-red';
}

/** Get a label for R² quality */
function rSquaredLabel(r2: number): string {
  if (r2 >= 0.99) return 'Excellent';
  if (r2 >= 0.95) return 'Good';
  if (r2 >= 0.9) return 'Acceptable';
  return 'Poor';
}

/** Format a number for display */
function fmt(n: number, decimals: number = 6): string {
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.001 && n !== 0)) {
    return n.toExponential(3);
  }
  return n.toFixed(decimals).replace(/\.?0+$/, '') || '0';
}

export function SlopeInfo({ regression }: SlopeInfoProps) {
  if (!regression) {
    return (
      <div className="px-3 py-3">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Regression
        </h3>
        <p className="text-sm text-text-muted italic">
          Enter at least 2 data points to see regression statistics.
        </p>
      </div>
    );
  }

  const { slope, intercept, rSquared } = regression;

  return (
    <div className="px-3 py-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
        Regression
      </h3>

      <div className="space-y-2.5">
        {/* Equation */}
        <div className="bg-surface-input/60 rounded-lg px-3 py-2 border border-border-subtle/50">
          <div className="text-xs text-text-muted mb-1">Equation</div>
          <div className="text-sm font-mono text-text-primary">
            y = <span className="text-accent-cyan">{fmt(slope)}</span>x
            {intercept >= 0 ? ' + ' : ' − '}
            <span className="text-accent-cyan">{fmt(Math.abs(intercept))}</span>
          </div>
        </div>

        {/* Slope & Intercept */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-input/60 rounded-lg px-3 py-2 border border-border-subtle/50">
            <div className="text-xs text-text-muted mb-0.5">Slope (m)</div>
            <div className="text-sm font-mono text-text-primary">{fmt(slope)}</div>
          </div>
          <div className="bg-surface-input/60 rounded-lg px-3 py-2 border border-border-subtle/50">
            <div className="text-xs text-text-muted mb-0.5">Intercept (b)</div>
            <div className="text-sm font-mono text-text-primary">{fmt(intercept)}</div>
          </div>
        </div>

        {/* R² */}
        <div className="bg-surface-input/60 rounded-lg px-3 py-2 border border-border-subtle/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-muted mb-0.5">R² Value</div>
              <div className={`text-lg font-mono font-semibold ${rSquaredColor(rSquared)}`}>
                {rSquared.toFixed(6)}
              </div>
            </div>
            <div
              className={`text-xs font-medium px-2 py-1 rounded-full ${rSquaredColor(rSquared)} bg-current/10`}
            >
              {rSquaredLabel(rSquared)}
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-2 h-1.5 bg-surface-dark rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                rSquared >= 0.99
                  ? 'bg-accent-green'
                  : rSquared >= 0.95
                    ? 'bg-accent-cyan'
                    : rSquared >= 0.9
                      ? 'bg-accent-amber'
                      : 'bg-accent-red'
              }`}
              style={{ width: `${rSquared * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
