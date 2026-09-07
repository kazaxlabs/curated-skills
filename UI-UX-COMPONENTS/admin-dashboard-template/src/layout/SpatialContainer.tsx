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
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        ...style
      }}
    >
      {(title || actions) && (
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-hairline-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {title && (
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                {title}
              </h3>
            )}
            {badge && <span className="badge badge-neutral">{badge}</span>}
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
