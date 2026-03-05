/**
 * MobileNavBar.tsx — Bottom navigation bar for mobile devices
 *
 * Provides quick access to: Graph, Data Entry, Settings
 * Fixed at bottom of screen, 44px+ touch targets
 * Animated active state indicator
 */

import type { ReactElement } from 'react';
import { motion } from 'framer-motion';

type NavTab = 'graph' | 'data' | 'settings';

interface MobileNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  darkMode: boolean;
  dataEntryOpen: boolean;
  settingsOpen: boolean;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: (props: { className?: string }) => ReactElement;
}

// Graph icon
function GraphIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

// Data/Table icon
function DataIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
      <path d="M3 10h18" />
      <path d="M10 3v18" />
    </svg>
  );
}

// Settings icon
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { id: 'graph', label: 'Graph', icon: GraphIcon },
  { id: 'data', label: 'Data', icon: DataIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function MobileNavBar({
  activeTab,
  onTabChange,
  darkMode,
  dataEntryOpen,
  settingsOpen,
}: MobileNavBarProps) {
  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-30
        md:hidden
        border-t
        ${darkMode
          ? 'bg-surface-card/95 border-border-subtle backdrop-blur-md'
          : 'bg-white/95 border-gray-200 backdrop-blur-md'}
        safe-area-pb
      `}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.id === activeTab;
          const isOpen = item.id === 'data' ? dataEntryOpen : item.id === 'settings' ? settingsOpen : false;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                relative flex flex-col items-center justify-center
                min-w-[64px] min-h-[44px]
                px-3 py-1
                rounded-lg
                transition-colors duration-200
                ${isActive || isOpen
                  ? darkMode
                    ? 'text-accent-indigo'
                    : 'text-indigo-600'
                  : darkMode
                    ? 'text-text-muted hover:text-text-secondary'
                    : 'text-gray-500 hover:text-gray-700'}
              `}
              aria-label={item.label}
              aria-pressed={isActive}
            >
              {/* Active indicator background */}
              {(isActive || isOpen) && (
                <motion.div
                  layoutId="mobileNavActive"
                  className={`
                    absolute inset-0 rounded-lg
                    ${darkMode ? 'bg-accent-indigo/10' : 'bg-indigo-50'}
                  `}
                  transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                />
              )}

              {/* Icon */}
              <item.icon className="w-5 h-5 relative z-10" />

              {/* Label */}
              <span className="text-[10px] font-medium mt-0.5 relative z-10">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Safe area spacer for notched devices */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
