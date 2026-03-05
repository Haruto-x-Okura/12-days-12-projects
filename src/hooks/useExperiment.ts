/**
 * useExperiment.ts — Provides metadata for the selected experiment preset.
 *
 * Phase 0: returns generic defaults.
 * Phase 6: returns real experiment axis labels, interpretations, and sample data.
 */

import { useMemo } from 'react';
import { EXPERIMENT_PRESETS } from '../utils/physicsConstants';
import type { ExperimentPreset } from '../utils/physicsConstants';

export interface ExperimentInfo {
    preset: ExperimentPreset | null;
    xLabel: string;
    yLabel: string;
    xUnit: string;
    yUnit: string;
    slopeInterpretation: string;
}

/**
 * Looks up the chosen experiment preset by ID.
 * Returns generic axis labels when no preset is selected.
 */
export function useExperiment(presetId: string | null): ExperimentInfo {
    return useMemo(() => {
        if (!presetId) {
            return {
                preset: null,
                xLabel: 'X',
                yLabel: 'Y',
                xUnit: '',
                yUnit: '',
                slopeInterpretation: '',
            };
        }

        const preset = EXPERIMENT_PRESETS.find((p) => p.id === presetId) ?? null;
        if (!preset) {
            return {
                preset: null,
                xLabel: 'X',
                yLabel: 'Y',
                xUnit: '',
                yUnit: '',
                slopeInterpretation: '',
            };
        }

        return {
            preset,
            xLabel: `${preset.xLabel} (${preset.xUnit})`,
            yLabel: `${preset.yLabel} (${preset.yUnit})`,
            xUnit: preset.xUnit,
            yUnit: preset.yUnit,
            slopeInterpretation: preset.slopeInterpretation,
        };
    }, [presetId]);
}
