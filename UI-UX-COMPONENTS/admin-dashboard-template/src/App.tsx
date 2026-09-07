import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar001 } from './layout/Sidebar001';
import { TopBar } from './layout/TopBar';
import { ToastHUD, ToastMessage } from './layout/ToastHUD';
import { CommandPalette } from './layout/CommandPalette';
import { REGISTERED_MODULES } from './config/modules.config';
import { defaultStorageAdapter } from './adapters/MockStorageAdapter';
import { CrmModule } from './modules/crm/CrmModule';
import { CmsModule } from './modules/cms/CmsModule';
import { AnalyticsModule } from './modules/analytics/AnalyticsModule';
import { SecurityModule } from './modules/security/SecurityModule';
import { StaffModule } from './modules/staff/StaffModule';
import { StaffUser } from './types/staff';

export const App: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<string>('crm');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(defaultStorageAdapter.isDemoFixturesEnabled());
  const [currentUser, setCurrentUser] = useState<StaffUser | undefined>(undefined);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isQuickNewLeadOpen, setIsQuickNewLeadOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('atelier_theme') as 'light' | 'dark') || 'light';
  });
  const [, setRerenderKey] = useState(0);

  // Sync theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('atelier_theme', theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      showToast(`Switched to ${next === 'dark' ? 'Space Black' : 'Alpine White'} theme`, 'info');
      return next;
    });
  }, []);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({
      id: `toast_${Date.now()}`,
      type,
      text
    });
  }, []);

  // Subscribe to adapter changes (e.g. when demo fixtures are toggled or records created)
  useEffect(() => {
    const unsubscribe = defaultStorageAdapter.subscribe(() => {
      setRerenderKey(k => k + 1);
    });

    defaultStorageAdapter.getStaffUsers().then(users => {
      if (users.length > 0) setCurrentUser(users[0]);
    });

    return () => unsubscribe();
  }, []);

  // Global keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleDemoMode = (enabled: boolean) => {
    defaultStorageAdapter.setDemoFixturesEnabled(enabled);
    setIsDemoMode(enabled);
    showToast(enabled ? 'Demo fixtures loaded' : 'Switched to clean zero-state shell', 'info');
  };

  const handleQuickBackup = async () => {
    const snap = await defaultStorageAdapter.triggerBackup();
    showToast(`Snapshot ${snap.id} created successfully`, 'success');
  };

  const activeModule = REGISTERED_MODULES.find(m => m.id === activeModuleId) || REGISTERED_MODULES[0];

  const renderActiveModule = () => {
    switch (activeModuleId) {
      case 'crm':
        return (
          <CrmModule
            adapter={defaultStorageAdapter}
            globalSearchQuery={globalSearchQuery}
            onShowToast={showToast}
            isNewLeadModalOpenExternal={isQuickNewLeadOpen}
            onCloseNewLeadModalExternal={() => setIsQuickNewLeadOpen(false)}
          />
        );
      case 'cms':
        return (
          <CmsModule
            adapter={defaultStorageAdapter}
            globalSearchQuery={globalSearchQuery}
            onShowToast={showToast}
          />
        );
      case 'analytics':
        return (
          <AnalyticsModule
            adapter={defaultStorageAdapter}
            globalSearchQuery={globalSearchQuery}
            onShowToast={showToast}
          />
        );
      case 'security':
        return (
          <SecurityModule
            adapter={defaultStorageAdapter}
            globalSearchQuery={globalSearchQuery}
            onShowToast={showToast}
          />
        );
      case 'staff':
        return (
          <StaffModule
            adapter={defaultStorageAdapter}
            globalSearchQuery={globalSearchQuery}
            onShowToast={showToast}
          />
        );
      default:
        return (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <h2>Module '{activeModuleId}' is not loaded.</h2>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      {/* Floating Status Toast HUD */}
      <ToastHUD toast={toast} onDismiss={() => setToast(null)} />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        modules={REGISTERED_MODULES}
        onSelectModule={setActiveModuleId}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onQuickNewLead={() => setIsQuickNewLeadOpen(true)}
        onQuickBackup={handleQuickBackup}
      />

      {/* Sidebar001: KazaLabs Collapsible Navigation Rail */}
      <Sidebar001
        modules={REGISTERED_MODULES}
        activeModuleId={activeModuleId}
        onSelectModule={setActiveModuleId}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <TopBar
          moduleTitle={activeModule.label}
          moduleDescription={activeModule.description}
          isDemoMode={isDemoMode}
          onToggleDemoMode={handleToggleDemoMode}
          searchQuery={globalSearchQuery}
          onSearchChange={setGlobalSearchQuery}
          currentUser={currentUser}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onQuickNewLead={() => setIsQuickNewLeadOpen(true)}
        />

        {/* Scrollable Canvas for Active Module */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--surface-canvas)' }}>
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};
