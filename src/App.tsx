/**
 * App.tsx — Root component for GraphX Lab Graph Plotter.
 *
 * Mobile-first responsive design featuring:
 * - Data entry as bottom sheet (mobile) / side drawer (desktop)
 * - Floating action button for quick data access
 * - Bottom navigation bar on mobile
 * - Smooth Framer Motion animations throughout
 * - Responsive graph canvas
 *
 * All state lives here and is passed down as props.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { generateId } from './utils/mathUtils';
import type { DataPoint } from './utils/mathUtils';
import { useGraphScale } from './hooks/useGraphScale';
import { useRegression } from './hooks/useRegression';
import { useExperiment } from './hooks/useExperiment';

import { DataPanel } from './components/DataPanel/DataPanel';
import { DataEntryDrawer } from './components/DataPanel/DataEntryDrawer';
import { GraphCanvas } from './components/Graph/GraphCanvas';
import { ScaleInfo } from './components/Graph/ScaleInfo';
import { ToggleControls } from './components/Controls/ToggleControls';
import { ExperimentPreset } from './components/Controls/ExperimentPreset';
import { SlopeInfo } from './components/SlopeInfo/SlopeInfo';
import { MobileNavBar } from './components/Navigation/MobileNavBar';
import { FloatingActionButton } from './components/Navigation/FloatingActionButton';

// ── Types ────────────────────────────────────────────────────

interface RawRow {
  id: string;
  x: string;
  y: string;
}

/** Create an empty row with a unique ID */
function emptyRow(): RawRow {
  return { id: generateId(), x: '', y: '' };
}

/** Default initial rows (5 empty) */
function initialRows(): RawRow[] {
  return Array.from({ length: 5 }, () => emptyRow());
}

type NavTab = 'graph' | 'data' | 'settings';

// ── App ──────────────────────────────────────────────────────

export default function App() {
  // ── Data State ──
  const [rows, setRows] = useState<RawRow[]>(initialRows);

  // ── Display State ──
  const [showGrid, setShowGrid] = useState(true);
  const [showBestFit, setShowBestFit] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // ── UI State ──
  const [dataEntryOpen, setDataEntryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('graph');
  const [isMobile, setIsMobile] = useState(false);

  // ── Experiment Preset State ──
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const experimentInfo = useExperiment(selectedPresetId);

  // Detect mobile viewport with debounced resize
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 768), 100);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Handle mobile nav tab changes
  const handleTabChange = useCallback((tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'data') {
      setDataEntryOpen(true);
    } else {
      setDataEntryOpen(false);
    }
    if (tab === 'settings') {
      setSettingsOpen(true);
    } else {
      setSettingsOpen(false);
    }
  }, []);

  // Close panels when switching to graph tab
  useEffect(() => {
    if (activeTab === 'graph') {
      setDataEntryOpen(false);
      setSettingsOpen(false);
    }
  }, [activeTab]);

  // ── Parse rows into DataPoints ──
  const dataPoints: DataPoint[] = useMemo(() => {
    return rows
      .map((r) => ({
        id: r.id,
        x: parseFloat(r.x),
        y: parseFloat(r.y),
      }))
      .filter((p) => isFinite(p.x) && isFinite(p.y));
  }, [rows]);

  // ── Compute scale and regression ──
  const scale = useGraphScale({
    points: dataPoints,
    canvasWidth: isMobile ? 350 : 720,
    canvasHeight: isMobile ? 280 : 500,
  });

  const regression = useRegression(dataPoints);

  // ── Handlers ──
  const handleAddRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow()]);
  }, []);

  const toggleDataEntry = useCallback(() => {
    setDataEntryOpen((prev) => !prev);
    setActiveTab((prev) => (prev === 'data' ? 'graph' : 'data'));
  }, []);

  return (
    <div className={darkMode ? '' : 'light-mode'}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? 'bg-surface-dark text-text-primary' : 'bg-gray-50 text-gray-900'
        }`}
      >
        {/* ── Header ─────────────────────────────────── */}
        <header
          className={`border-b px-4 md:px-6 py-3 flex items-center justify-between ${
            darkMode ? 'border-border-subtle bg-surface-card/50' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Logo / Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-indigo to-accent-cyan flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight">
                Graph<span className="text-accent-indigo">X</span>
              </h1>
              <p className={`text-xs ${darkMode ? 'text-text-muted' : 'text-gray-500'}`}>
                Lab Graph Plotter
              </p>
            </div>
          </div>

          {/* Desktop: Points counter */}
          <div
            className={`hidden md:block text-xs font-mono px-3 py-1 rounded-full ${
              darkMode ? 'bg-surface-input text-text-muted' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {dataPoints.length} points plotted
          </div>
        </header>

        {/* ── Main Layout ────────────────────────────── */}
        <div className="flex h-[calc(100vh-57px-64px)] md:h-[calc(100vh-57px)]">
          {/* ── Desktop: Left Sidebar ───────────────── */}
          <aside
            className={`hidden md:flex w-80 flex-shrink-0 border-r flex-col overflow-hidden ${
              darkMode
                ? 'border-border-subtle bg-surface-card/30'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Data Panel — separated from controls */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 border-b border-border-subtle">
              <DataPanel
                rows={rows}
                onRowsChange={setRows}
                onAddRow={handleAddRow}
              />
            </div>

            {/* Controls Section - separated */}
            <div className="flex-shrink-0">
              {/* Toggle Controls */}
              <ToggleControls
                showGrid={showGrid}
                showBestFit={showBestFit}
                darkMode={darkMode}
                onToggleGrid={() => setShowGrid((v) => !v)}
                onToggleBestFit={() => setShowBestFit((v) => !v)}
                onToggleDarkMode={() => setDarkMode((v) => !v)}
              />

              {/* Experiment Preset */}
              <ExperimentPreset
                selectedPresetId={selectedPresetId}
                onSelectPreset={setSelectedPresetId}
              />
            </div>

            {/* Regression Info */}
            <div className="flex-shrink-0">
              <SlopeInfo regression={regression} />
            </div>
          </aside>

          {/* ── Graph Area ───────────────────────────── */}
          <main className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 md:p-6 overflow-auto pb-20 md:pb-6">
            <div
              className="w-full max-w-4xl flex flex-col items-center"
            >
              <GraphCanvas
                points={dataPoints}
                scale={scale}
                regression={regression}
                showGrid={showGrid}
                showBestFit={showBestFit}
                darkMode={darkMode}
                xLabel={experimentInfo.xLabel}
                yLabel={experimentInfo.yLabel}
              />
              <ScaleInfo
                scale={scale}
                xUnit={experimentInfo.xUnit}
                yUnit={experimentInfo.yUnit}
                darkMode={darkMode}
              />
            </div>

            {/* Mobile: Slope Info below graph */}
            <div
              className="w-full max-w-4xl mt-4 md:hidden"
            >
              <div className={`p-4 rounded-xl border ${
                darkMode
                  ? 'bg-surface-card/50 border-border-subtle'
                  : 'bg-white border-gray-200'
              }`}>
                <SlopeInfo regression={regression} />
              </div>
            </div>
          </main>
        </div>

        {/* ── Mobile: Data Entry Drawer (Bottom Sheet) ─ */}
        <DataEntryDrawer
          isOpen={dataEntryOpen}
          onClose={() => {
            setDataEntryOpen(false);
            setActiveTab('graph');
          }}
          rows={rows}
          onRowsChange={setRows}
          onAddRow={handleAddRow}
          darkMode={darkMode}
        />

        {/* ── Mobile: Bottom Navigation ────────────── */}
        <MobileNavBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          darkMode={darkMode}
          dataEntryOpen={dataEntryOpen}
          settingsOpen={settingsOpen}
        />

        {/* ── Mobile: Floating Action Button ───────── */}
        <FloatingActionButton
          onClick={toggleDataEntry}
          darkMode={darkMode}
          isOpen={dataEntryOpen}
        />
      </div>
    </div>
  );
}
