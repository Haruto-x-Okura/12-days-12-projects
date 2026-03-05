/**
 * ExperimentPreset.tsx — Dropdown for selecting a physics experiment preset.
 *
 * Phase 0: Renders a disabled stub dropdown.
 * Phase 6: Fully functional with preset list from physicsConstants.ts.
 */

import { EXPERIMENT_PRESETS } from '../../utils/physicsConstants';

interface ExperimentPresetProps {
  selectedPresetId: string | null;
  onSelectPreset: (id: string | null) => void;
}

export function ExperimentPreset({
  selectedPresetId,
  onSelectPreset,
}: ExperimentPresetProps) {
  const hasPresets = EXPERIMENT_PRESETS.length > 0;

  return (
    <div className="px-3 py-3 border-b border-border-subtle">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
        Experiment
      </h3>
      <select
        value={selectedPresetId ?? ''}
        onChange={(e) => onSelectPreset(e.target.value || null)}
        disabled={!hasPresets}
        className="w-full bg-surface-input border border-border-subtle rounded-lg px-3 py-2
                   text-sm text-text-secondary
                   focus:outline-none focus:border-border-focus
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors appearance-none cursor-pointer"
      >
        <option value="">
          {hasPresets ? '— Select preset —' : '— Coming soon —'}
        </option>
        {EXPERIMENT_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
