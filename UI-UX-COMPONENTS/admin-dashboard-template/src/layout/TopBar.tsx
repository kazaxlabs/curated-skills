import React from 'react';
import { 
  Search, 
  Sparkles, 
  CircleDot, 
  Shield 
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
}

export const TopBar: React.FC<TopBarProps> = ({
  moduleTitle,
  moduleDescription,
  isDemoMode,
  onToggleDemoMode,
  searchQuery,
  onSearchChange,
  currentUser
}) => {
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--surface-card)',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0
      }}
    >
      {/* Module Title & Subtitle */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)' }}>
            {moduleTitle}
          </h1>
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
            ARCHITECTURE SHELL
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--brand-text-muted)', marginTop: '2px' }}>
          {moduleDescription}
        </p>
      </div>

      {/* Right Controls: Search, Fixtures Switcher, User Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search input */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-ash)'
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: '32px', height: '32px' }}
          />
        </div>

        {/* Demo Mode Toggle Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-recessed)',
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid var(--color-hairline)'
          }}
        >
          {isDemoMode ? (
            <Sparkles size={14} style={{ color: 'var(--signal-risk)' }} />
          ) : (
            <CircleDot size={14} style={{ color: 'var(--color-ash)' }} />
          )}
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-text-secondary)' }}>
            {isDemoMode ? 'Demo Fixtures' : 'Empty Shell'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isDemoMode}
            onClick={() => onToggleDemoMode(!isDemoMode)}
            style={{
              width: '32px',
              height: '18px',
              backgroundColor: isDemoMode ? 'var(--color-ink)' : 'var(--color-hairline)',
              borderRadius: '9px',
              position: 'relative',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isDemoMode ? '16px' : '2px',
                transition: 'left 0.15s ease'
              }}
            />
          </button>
        </div>

        {/* User Identity Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '8px',
            borderLeft: '1px solid var(--color-hairline)'
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-ink)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'O'}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.2 }}>
              {currentUser?.name || 'Operator'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={10} style={{ color: 'var(--signal-live)' }} />
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
