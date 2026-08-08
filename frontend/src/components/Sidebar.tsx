import React, { useState } from 'react';
import { Repository } from '../types';
import { 
  Home, 
  Folder, 
  Clock, 
  Search, 
  RefreshCw, 
  ArrowLeft,
  Archive,
  FileText,
  Heart,
  Sun,
  Moon,
  FlaskConical,
  GitBranch, 
  GitCommit,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedRepo: Repository | null;
  onBackToWorkspace: () => void;
  onOpenSearch: () => void;
  onRefresh: () => void;
  isScanning: boolean;
  totalRepos: number;
  openPreviewsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  selectedRepo,
  onBackToWorkspace,
  onOpenSearch,
  onRefresh,
  isScanning,
  totalRepos,
  openPreviewsCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const globalMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'repositories', label: 'Repositories', icon: Folder, count: totalRepos },
    { id: 'activity', label: 'Activity Feed', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  const repoMenuItems = selectedRepo
    ? [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'testing', label: 'Testing & Verification', icon: FlaskConical },
        { id: 'graph', label: 'Commit Graph', icon: GitCommit },
        { id: 'branches', label: 'Branch Graph', icon: GitBranch },
        { id: 'stashes', label: 'Stashes', icon: Archive, count: selectedRepo.stashCount },
        { id: 'previews', label: 'File Previews', icon: FileText, count: openPreviewsCount },
        { id: 'changes', label: 'Working Tree', icon: FileText, count: selectedRepo.status.isClean ? undefined : selectedRepo.status.totalChanges },
        { id: 'health', label: 'Health', icon: Heart },
      ]
    : [];

  const [isDark, setIsDark] = useState(!document.body.classList.contains('light-theme'));

  const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
    setIsDark(!isDark);
  };

  const navButtonStyle = (isActive: boolean) => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: isCollapsed ? ('center' as const) : ('flex-start' as const),
    gap: '10px',
    padding: isCollapsed ? '10px 0' : '9px 12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: isActive ? 600 : 450,
    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
    border: isActive ? `1px solid var(--sidebar-active-border)` : '1px solid transparent',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
    width: '100%',
  });

  return (
    <aside style={{
      width: isCollapsed ? '68px' : '260px',
      minWidth: isCollapsed ? '68px' : '260px',
      borderRight: '1px solid var(--border-color)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--sidebar-bg)',
      padding: isCollapsed ? '16px 8px' : '20px 14px',
      transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* Brand Header with Collapse Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', marginBottom: '18px', paddingLeft: isCollapsed ? 0 : '4px' }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--accent-primary)',
              width: '32px', height: '32px',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Folder size={18} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)' }}>Git Explorer</h1>
              <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.04em' }}>WORKSPACE v1.0</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn-secondary"
          style={{ padding: '6px', borderRadius: 'var(--radius-md)' }}
          title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Search */}
      <button
        onClick={onOpenSearch}
        title="Search workspace (⌘K)"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '8px',
          background: 'var(--bg-input)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', padding: isCollapsed ? '10px 0' : '8px 12px',
          color: 'var(--text-subtle)', fontSize: '0.82rem',
          cursor: 'pointer', marginBottom: '18px', width: '100%',
          transition: 'all 0.15s ease',
        }}
      >
        <Search size={16} />
        {!isCollapsed && <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>}
        {!isCollapsed && (
          <kbd style={{
            background: 'var(--bg-input)', padding: '1px 6px', borderRadius: '4px',
            fontSize: '0.65rem', border: '1px solid var(--border-color)',
            color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)',
          }}>⌘K</kbd>
        )}
      </button>

      {/* Navigation */}
      {selectedRepo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <button
            onClick={onBackToWorkspace}
            title="Back to Workspace"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '8px',
              background: 'var(--sidebar-active-bg)',
              border: `1px solid var(--sidebar-active-border)`,
              color: 'var(--accent-primary)',
              borderRadius: 'var(--radius-md)', padding: isCollapsed ? '10px 0' : '8px 12px',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} />
            {!isCollapsed && <span>Back to Workspace</span>}
          </button>

          {/* Active Repo Info */}
          {!isCollapsed && (
            <div style={{
              background: 'var(--bg-tertiary)', padding: '12px',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedRepo.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--accent-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                <GitBranch size={12} /> {selectedRepo.currentBranch}
              </div>
            </div>
          )}

          {!isCollapsed && (
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px', paddingLeft: '4px' }}>
              Explorer
            </span>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {repoMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button key={item.id} onClick={() => setCurrentTab(item.id)} style={navButtonStyle(isActive)} title={item.label}>
                  <Icon size={16} color={isActive ? 'var(--accent-primary)' : 'var(--text-subtle)'} />
                  {!isCollapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                  {!isCollapsed && item.count !== undefined && item.count > 0 && (
                    <span className="badge badge-indigo">{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      ) : (
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          {!isCollapsed && (
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px', paddingLeft: '4px' }}>
              Workspace
            </span>
          )}
          {globalMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentTab(item.id)} style={navButtonStyle(isActive)} title={item.label}>
                <Icon size={16} color={isActive ? 'var(--accent-primary)' : 'var(--text-subtle)'} />
                {!isCollapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                {!isCollapsed && item.count !== undefined && (
                  <span className="badge badge-primary">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Bottom Actions */}
      <div style={{ display: 'flex', flexDirection: isCollapsed ? 'column' : 'row', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <button
          className="btn-secondary"
          onClick={toggleTheme}
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', padding: isCollapsed ? '8px 0' : '7px 10px' }}
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          {!isCollapsed && <span>{isDark ? 'Light' : 'Dark'}</span>}
        </button>
        <button
          className="btn-secondary"
          onClick={onRefresh}
          disabled={isScanning}
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', padding: isCollapsed ? '8px 0' : '7px 10px' }}
          title="Rescan Workspace Directory"
        >
          <RefreshCw size={15} className={isScanning ? 'animate-spin' : ''} />
          {!isCollapsed && <span>Rescan</span>}
        </button>
      </div>
    </aside>
  );
};
