/**
 * DataPanel.tsx — Tabular data entry panel with animations.
 *
 * Manages the raw string state for inputs and emits parsed DataPoint
 * arrays to the parent. Supports adding / deleting rows with animations.
 * Features:
 * - New rows slide down + fade in when added
 * - Deleted rows slide out + collapse before removal
 * - Scrolls to bottom when new row added
 */

import { useCallback, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DataRow } from './DataRow';

interface RawRow {
  id: string;
  x: string;
  y: string;
}

interface DataPanelProps {
  rows: RawRow[];
  onRowsChange: (rows: RawRow[]) => void;
  onAddRow: () => void;
}

export function DataPanel({ rows, onRowsChange, onAddRow }: DataPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevRowCount = useRef(rows.length);

  // Scroll to bottom when a new row is added
  useEffect(() => {
    if (rows.length > prevRowCount.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevRowCount.current = rows.length;
  }, [rows.length]);

  const handleChange = useCallback(
    (index: number, field: 'x' | 'y', value: string) => {
      const updated = [...rows];
      updated[index] = { ...updated[index], [field]: value };
      onRowsChange(updated);
    },
    [rows, onRowsChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const updated = rows.filter((_, i) => i !== index);
      onRowsChange(updated);
    },
    [rows, onRowsChange]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with section title */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-surface-card/50"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent-indigo">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          <h2 className="text-sm font-semibold text-text-primary tracking-wide uppercase">
            Data Points
          </h2>
        </div>
        <span className="text-xs text-text-muted font-mono">
          {rows.length} pts
        </span>
      </div>

      {/* Scrollable table */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-2 py-2 text-xs font-medium text-text-muted text-center w-8">
                #
              </th>
              <th className="px-1 py-2 text-xs font-medium text-text-secondary text-left">
                X
              </th>
              <th className="px-1 py-2 text-xs font-medium text-text-secondary text-left">
                Y
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {rows.map((row, i) => (
                <DataRow
                  key={row.id}
                  index={i}
                  x={row.x}
                  y={row.y}
                  onChange={handleChange}
                  onDelete={handleDelete}
                  canDelete={rows.length > 2}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Add row button - simplified */}
      <div
        className="px-3 py-2 border-t border-border-subtle"
      >
        <button
          onClick={onAddRow}
          className="w-full min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5
                     bg-surface-input border border-border-subtle rounded-lg
                     text-sm text-text-secondary hover:text-text-primary
                     hover:border-accent-indigo/40 hover:bg-accent-indigo/5
                     transition-all duration-200 cursor-pointer touch-manipulation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add Row
        </button>
      </div>
    </div>
  );
}
