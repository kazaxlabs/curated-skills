import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Layers
} from 'lucide-react';
import { ModuleConfig } from '../config/modules.config';

interface Sidebar001Props {
  modules: ModuleConfig[];
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  appName?: string;
  appBadge?: string;
}

export const Sidebar001: React.FC<Sidebar001Props> = ({
  modules,
  activeModuleId,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  appName = 'KAZALABS',
  appBadge = 'OS'
}) => {
  return (
    <aside
      style={{
        width: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
        minWidth: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
        height: '100vh',
        backgroundColor: 'var(--surface-card)',
        borderRight: '1px solid var(--color-hairline)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 100,
        transition: 'width 0.22s cubic-bezier(0.2, 0, 0, 1), min-width 0.22s cubic-bezier(0.2, 0, 0, 1)',
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
          padding: isCollapsed ? '0' : '0 16px',
          borderBottom: '1px solid var(--color-hairline-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: 'var(--color-ink)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}
          >
            <Layers size={16} />
          </div>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>{appName}</span>
              <span className="badge badge-neutral" style={{ fontSize: '9px', padding: '1px 5px' }}>{appBadge}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '12px 6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                padding: isCollapsed ? '10px 0' : '10px 12px',
                borderRadius: '4px',
                backgroundColor: isActive ? 'var(--color-ink)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--brand-text-secondary)',
                gap: '12px',
                position: 'relative'
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

      {/* Footer Collapse Action */}
      <div
        style={{
          padding: '12px 6px',
          borderTop: '1px solid var(--color-hairline-subtle)',
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'flex-end'
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="btn-ghost"
          style={{ width: isCollapsed ? '36px' : 'auto', height: '36px', justifyContent: 'center' }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
