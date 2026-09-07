import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Sparkles, 
  Plus, 
  Database, 
  ArrowRight 
} from 'lucide-react';
import { ModuleConfig } from '../config/modules.config';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleConfig[];
  onSelectModule: (id: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  onQuickNewLead: () => void;
  onQuickBackup: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Preferences';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  modules,
  onSelectModule,
  theme,
  onToggleTheme,
  isDemoMode,
  onToggleDemoMode,
  onQuickNewLead,
  onQuickBackup
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allCommands: CommandItem[] = [
    // Navigation
    ...modules.map(m => ({
      id: `nav_${m.id}`,
      category: 'Navigation' as const,
      title: `Go to ${m.label}`,
      subtitle: m.description,
      icon: m.icon,
      action: () => {
        onSelectModule(m.id);
        onClose();
      }
    })),
    // Actions
    {
      id: 'act_new_lead',
      category: 'Actions',
      title: 'Intake New Lead Inquiry',
      subtitle: 'Open manual CRM intake modal',
      icon: Plus,
      action: () => {
        onSelectModule('crm');
        onQuickNewLead();
        onClose();
      }
    },
    {
      id: 'act_backup',
      category: 'Actions',
      title: 'Trigger System Snapshot',
      subtitle: 'Archive active database collections to snapshot',
      icon: Database,
      action: () => {
        onQuickBackup();
        onClose();
      }
    },
    // Preferences
    {
      id: 'pref_theme',
      category: 'Preferences',
      title: theme === 'light' ? 'Switch to Dark Cockpit Mode' : 'Switch to Alpine Light Mode',
      subtitle: 'Toggle global color theme',
      icon: theme === 'light' ? Moon : Sun,
      action: () => {
        onToggleTheme();
        onClose();
      }
    },
    {
      id: 'pref_demo',
      category: 'Preferences',
      title: isDemoMode ? 'Switch to Empty Shell Mode' : 'Populate Demo Fixtures',
      subtitle: 'Toggle between pristine zero-states and test fixtures',
      icon: Sparkles,
      action: () => {
        onToggleDemoMode(!isDemoMode);
        onClose();
      }
    }
  ];

  const filteredCommands = allCommands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    (cmd.subtitle && cmd.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '560px',
          width: '92%',
          background: 'var(--surface-card)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-modal)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid var(--color-hairline)'
          }}
        >
          <Search size={18} style={{ color: 'var(--color-ash)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            placeholder="Type a command or jump to module... (Esc to close)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              border: 'none',
              boxShadow: 'none',
              padding: '0',
              fontSize: '14px',
              fontWeight: 500
            }}
          />
          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>ESC</span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--brand-text-muted)' }}>
              No commands matching "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--surface-recessed)' : 'transparent',
                    transition: 'background-color 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? 'var(--color-ink)' : 'var(--surface-recessed)',
                        color: isSelected ? 'var(--surface-card)' : 'var(--brand-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand-text-primary)' }}>
                        {cmd.title}
                      </div>
                      {cmd.subtitle && (
                        <div style={{ fontSize: '11px', color: 'var(--brand-text-muted)', marginTop: '2px' }}>
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight size={14} style={{ color: 'var(--brand-text-secondary)' }} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--brand-text-muted)',
            backgroundColor: 'var(--surface-recessed)'
          }}
        >
          <span>Use <kbd style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-hairline)', fontFamily: 'var(--font-mono)' }}>↑</kbd> <kbd style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-hairline)', fontFamily: 'var(--font-mono)' }}>↓</kbd> to navigate</span>
          <span><kbd style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-hairline)', fontFamily: 'var(--font-mono)' }}>Enter</kbd> to select</span>
          <span><kbd style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-hairline)', fontFamily: 'var(--font-mono)' }}>Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
