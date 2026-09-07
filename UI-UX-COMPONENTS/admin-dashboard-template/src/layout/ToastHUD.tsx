import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastHUDProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const ToastHUD: React.FC<ToastHUDProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const Icon = toast.type === 'success' 
    ? CheckCircle2 
    : toast.type === 'error' 
    ? AlertCircle 
    : Info;

  const iconColor = toast.type === 'success'
    ? 'var(--signal-live)'
    : toast.type === 'error'
    ? 'var(--signal-danger)'
    : 'var(--signal-info)';

  return (
    <div className="toast-hud">
      <Icon size={16} style={{ color: iconColor, flexShrink: 0 }} />
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-text-primary)' }}>
        {toast.text}
      </span>
      <button
        onClick={onDismiss}
        className="btn-ghost"
        style={{ padding: '2px', marginLeft: '4px', borderRadius: '50%' }}
      >
        <X size={12} />
      </button>
    </div>
  );
};
