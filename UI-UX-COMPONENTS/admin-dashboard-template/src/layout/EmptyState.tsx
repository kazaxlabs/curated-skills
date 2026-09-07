import React from 'react';
import { Inbox, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ComponentType<{ size?: number }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus
}) => {
  return (
    <div
      style={{
        padding: '72px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'var(--surface-card)',
        borderRadius: '10px'
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          backgroundColor: 'var(--surface-recessed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
          color: 'var(--brand-text-muted)',
          border: '1px solid var(--color-hairline)'
        }}
      >
        <Icon size={28} />
      </div>
      <h4 style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: '8px' }}>
        {title}
      </h4>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--brand-text-muted)',
          maxWidth: '400px',
          lineHeight: 1.6,
          marginBottom: actionLabel ? '24px' : '0'
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary" style={{ padding: '9px 18px' }}>
          <ActionIcon size={14} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
