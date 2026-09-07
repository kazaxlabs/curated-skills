import React from 'react';
import { 
  Search, 
  Sparkles, 
  CircleDot, 
  Plus 
} from 'lucide-react';
import { StaffUser } from '../types/staff';

interface TopBarProps {
  moduleTitle: string;
  moduleDescription: string;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser?: StaffUser;
  onOpenCommandPalette: () => void;
  onQuickNewLead?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  moduleTitle,
  moduleDescription,
  isDemoMode,
  onToggleDemoMode,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenCommandPalette,
  onQuickNewLead
}) => {
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--surface-glass)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        zIndex: 50
      }}
    >
      {/* Module Title & Subtitle */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
            {moduleTitle}
          </h1>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
            ATELIER SHELL
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--brand-text-muted)', marginTop: '2px' }}>
          {moduleDescription}
        </p>
      </div>

      {/* Right Controls: Search / Command Palette, Fixtures Switcher, Quick Action, User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Search input with Command Palette badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-recessed)',
            padding: '4px 10px',
            borderRadius: '8px',
            border: '1px solid var(--color-hairline)',
            width: '210px'
          }}
        >
          <Search size={14} style={{ color: 'var(--color-ash)', flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              color: 'var(--brand-text-primary)',
              width: '100%'
            }}
          />
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="badge badge-neutral"
            style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', cursor: 'pointer' }}
            title="Open Command Palette (Ctrl+K)"
          >
            Ctrl+K
          </button>
        </div>

        {/* Demo Mode Toggle Switch (Segmented Pill) */}
        <div className="segmented-control" title="Toggle between empty zero-states and populated demo fixtures">
          <button
            type="button"
            className={`segmented-control-btn ${!isDemoMode ? 'active' : ''}`}
            onClick={() => onToggleDemoMode(false)}
          >
            <CircleDot size={12} style={{ marginRight: '4px' }} />
            Empty
          </button>
          <button
            type="button"
            className={`segmented-control-btn ${isDemoMode ? 'active' : ''}`}
            onClick={() => onToggleDemoMode(true)}
          >
            <Sparkles size={12} style={{ marginRight: '4px', color: isDemoMode ? 'var(--signal-risk)' : undefined }} />
            Demo
          </button>
        </div>

        {/* Quick New Lead CTA */}
        {onQuickNewLead && (
          <button
            onClick={onQuickNewLead}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            <Plus size={13} />
            <span>Intake</span>
          </button>
        )}

        {/* User Identity Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--color-hairline)'
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-ink)',
              color: 'var(--surface-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.2, color: 'var(--color-ink)' }}>
              {currentUser?.name || 'Operator'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--signal-live)'
                }}
              />
              <span style={{ fontSize: '10px', color: 'var(--brand-text-muted)', textTransform: 'capitalize' }}>
                {currentUser?.role || 'owner'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
