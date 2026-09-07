import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  Sun,
  Moon,
  Terminal
} from 'lucide-react';
import { ModuleConfig } from '../config/modules.config';

interface Sidebar001Props {
  modules: ModuleConfig[];
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
  appName?: string;
  appBadge?: string;
}

export const Sidebar001: React.FC<Sidebar001Props> = ({
  modules,
  activeModuleId,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
  appName = 'ATELIER',
  appBadge = 'PRO'
}) => {
  return (
    <aside
      style={{
        width: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
        minWidth: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
        height: '100vh',
        backgroundColor: 'var(--surface-glass)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid var(--color-hairline)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 100,
        transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '0' : '0 18px',
          borderBottom: '1px solid var(--color-hairline-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: 'var(--color-ink)',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--surface-card)',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}
          >
            <Layers size={16} />
          </div>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
                {appName}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '9px', padding: '1px 5px' }}>
                {appBadge}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {modules.map((mod) => {
          const isActive = mod.id === activeModuleId;
          const Icon = mod.icon;

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              title={isCollapsed ? mod.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                width: '100%',
                padding: isCollapsed ? '10px 0' : '10px 14px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'var(--color-ink)' : 'transparent',
                color: isActive ? 'var(--surface-card)' : 'var(--brand-text-secondary)',
                gap: '12px',
                position: 'relative',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Icon size={18} />
              {!isCollapsed && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {mod.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Utilities: Command Palette shortcut, Theme Switcher, Collapse */}
      <div
        style={{
          padding: '12px 8px',
          borderTop: '1px solid var(--color-hairline-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {/* Command palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="btn-ghost"
          style={{
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '8px 0' : '8px 12px'
          }}
          title="Open Command Palette (Ctrl+K)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={16} />
            {!isCollapsed && <span style={{ fontSize: '11px', fontWeight: 600 }}>Commands</span>}
          </div>
          {!isCollapsed && (
            <span className="badge badge-neutral" style={{ fontSize: '9px', padding: '1px 5px', fontWeight: 600 }}>Ctrl+K</span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="btn-ghost"
          style={{
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '8px 0' : '8px 12px'
          }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          {!isCollapsed && (
            <span style={{ fontSize: '11px', fontWeight: 600 }}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          )}
        </button>

        {/* Sidebar Collapse Action */}
        <button
          onClick={onToggleCollapse}
          className="btn-ghost"
          style={{
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '8px 0' : '8px 12px'
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!isCollapsed && <span style={{ fontSize: '11px', fontWeight: 600 }}>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
