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
        padding: '64px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'var(--surface-card)',
        borderRadius: '6px'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--surface-recessed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--color-ash)',
          border: '1px solid var(--color-hairline)'
        }}
      >
        <Icon size={26} />
      </div>
      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
        {title}
      </h4>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--brand-text-muted)',
          maxWidth: '380px',
          lineHeight: 1.5,
          marginBottom: actionLabel ? '20px' : '0'
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          <ActionIcon size={14} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
