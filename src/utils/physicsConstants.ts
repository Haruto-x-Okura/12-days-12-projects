/**
 * physicsConstants.ts — Physical constants and experiment metadata.
 *
 * Used by experiment presets and the physical-constants interpreter
 * in later phases. Phase 0 exports only the constants themselves.
 */

// ── Fundamental Constants (SI units) ─────────────────────────

export const CONSTANTS = {
    /** Planck's constant (J·s) */
    h: 6.62607015e-34,
    /** Reduced Planck's constant ℏ (J·s) */
    hbar: 1.054571817e-34,
    /** Elementary charge (C) */
    e: 1.602176634e-19,
    /** Speed of light (m/s) */
    c: 299792458,
    /** Boltzmann constant (J/K) */
    k_B: 1.380649e-23,
    /** Electron mass (kg) */
    m_e: 9.1093837015e-31,
    /** Avogadro's number (1/mol) */
    N_A: 6.02214076e23,
    /** Permittivity of free space (F/m) */
    epsilon_0: 8.8541878128e-12,
    /** Permeability of free space (H/m) */
    mu_0: 1.25663706212e-6,
    /** Stefan–Boltzmann constant (W/m²·K⁴) */
    sigma: 5.670374419e-8,
} as const;

// ── Experiment Preset Definitions ────────────────────────────

export interface ExperimentPreset {
    id: string;
    name: string;
    description: string;
    xLabel: string;
    yLabel: string;
    xUnit: string;
    yUnit: string;
    /** What the slope represents physically */
    slopeInterpretation: string;
    /** The expected constant symbol (e.g. "h", "k_B") */
    expectedConstantKey?: keyof typeof CONSTANTS;
    /** Factor to convert slope to the constant: constant = slope × factor */
    slopeFactor?: number;
    /** Sample data for quick demo */
    sampleData: { x: number; y: number }[];
}

/**
 * Experiment presets — stub array for Phase 0.
 * Fully populated in Phase 6.
 */
export const EXPERIMENT_PRESETS: ExperimentPreset[] = [];
