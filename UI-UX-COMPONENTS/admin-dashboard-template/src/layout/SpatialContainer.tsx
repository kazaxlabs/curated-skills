import React from 'react';

interface SpatialContainerProps {
  title?: string;
  badge?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const SpatialContainer: React.FC<SpatialContainerProps> = ({
  title,
  badge,
  actions,
  children,
  style
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--color-hairline)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        ...style
      }}
    >
      {(title || actions) && (
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-hairline-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {title && (
              <h3 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--color-ink)' }}>
                {title}
              </h3>
            )}
            {badge && <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{badge}</span>}
          </div>
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{actions}</div>}
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
};
