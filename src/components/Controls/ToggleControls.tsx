/**
 * ToggleControls.tsx — Toggle switches for graph display options.
 *
 * Currently supports: Show Grid, Show Best Fit, Dark Mode.
 * Later phases add: Graph Paper Mode, Log Axes, etc.
 */

interface ToggleControlsProps {
  showGrid: boolean;
  showBestFit: boolean;
  darkMode: boolean;
  onToggleGrid: () => void;
  onToggleBestFit: () => void;
  onToggleDarkMode: () => void;
}

/** A single toggle switch row */
function Toggle({
  label,
  checked,
  onChange,
  accentColor = 'bg-accent-indigo',
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  accentColor?: string;
}) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`
          relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer
          ${checked ? accentColor : 'bg-surface-input border border-border-subtle'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  );
}

export function ToggleControls({
  showGrid,
  showBestFit,
  darkMode,
  onToggleGrid,
  onToggleBestFit,
  onToggleDarkMode,
}: ToggleControlsProps) {
  return (
    <div className="px-3 py-3 border-b border-border-subtle">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
        Display
      </h3>
      <div className="space-y-0.5">
        <Toggle label="Grid" checked={showGrid} onChange={onToggleGrid} />
        <Toggle
          label="Best Fit"
          checked={showBestFit}
          onChange={onToggleBestFit}
          accentColor="bg-accent-cyan"
        />
        <Toggle
          label="Dark Mode"
          checked={darkMode}
          onChange={onToggleDarkMode}
          accentColor="bg-accent-purple"
        />
      </div>
    </div>
  );
}
