import React from 'react';
import { Repository } from '../types';
import { 
  HomeIcon, 
  FolderIcon, 
  ClockIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  ArrowLeftIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  HeartIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { GitBranch, GitCommit } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedRepo: Repository | null;
  onBackToWorkspace: () => void;
  onOpenSearch: () => void;
  onRefresh: () => void;
  isScanning: boolean;
  totalRepos: number;
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
}) => {
  const globalMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'repositories', label: 'Repositories', icon: FolderIcon, count: totalRepos },
    { id: 'activity', label: 'Activity Feed', icon: ClockIcon },
  ];

  const repoMenuItems = selectedRepo
    ? [
        { id: 'graph', label: 'Commit Graph', icon: GitCommit },
        { id: 'branches', label: 'Branch Graph', icon: GitBranch },
        { id: 'stashes', label: 'Stashes', icon: ArchiveBoxIcon, count: selectedRepo.stashCount },
        { id: 'changes', label: 'Working Tree', icon: DocumentTextIcon, count: selectedRepo.status.isClean ? undefined : selectedRepo.status.totalChanges },
        { id: 'health', label: 'Health', icon: HeartIcon },
      ]
    : [];

  const [isDark, setIsDark] = React.useState(!document.body.classList.contains('light-theme'));

  const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
    setIsDark(!isDark);
  };

  const navButtonStyle = (isActive: boolean) => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '10px',
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: isActive ? 600 : 450,
    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
    border: isActive ? `1px solid var(--sidebar-active-border)` : '1px solid transparent',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
  });

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      borderRight: '1px solid var(--border-color)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--sidebar-bg)',
      padding: '20px 14px',
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingLeft: '4px' }}>
        <div style={{
          background: 'var(--accent-primary)',
          width: '32px', height: '32px',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FolderIcon className="icon-md" style={{ color: '#ffffff' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)' }}>Git Explorer</h1>
          <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.04em' }}>WORKSPACE v1.0</span>
        </div>
      </div>

      {/* Quick Search */}
      <button
        onClick={onOpenSearch}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-input)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', padding: '8px 12px',
          color: 'var(--text-subtle)', fontSize: '0.82rem',
          cursor: 'pointer', marginBottom: '18px', width: '100%',
          transition: 'all 0.15s ease',
        }}
      >
        <MagnifyingGlassIcon className="icon-sm" />
        <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
        <kbd style={{
          background: 'var(--bg-input)', padding: '1px 6px', borderRadius: '4px',
          fontSize: '0.65rem', border: '1px solid var(--border-color)',
          color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)',
        }}>⌘K</kbd>
      </button>

      {/* Navigation */}
      {selectedRepo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <button
            onClick={onBackToWorkspace}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--sidebar-active-bg)',
              border: `1px solid var(--sidebar-active-border)`,
              color: 'var(--accent-primary)',
              borderRadius: 'var(--radius-md)', padding: '8px 12px',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeftIcon className="icon-sm" />
            Back to Workspace
          </button>

          {/* Active Repo Info */}
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

          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px', paddingLeft: '4px' }}>
            Explorer
          </span>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {repoMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isHero = typeof Icon !== 'function' || Icon.name === 'Icon' || !Icon.toString().includes('lucide');

              return (
                <button key={item.id} onClick={() => setCurrentTab(item.id)} style={navButtonStyle(isActive)}>
                  {isHero ? (
                    <Icon className="icon-sm" style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-subtle)' }} />
                  ) : (
                    <Icon size={16} color={isActive ? 'var(--accent-primary)' : 'var(--text-subtle)'} />
                  )}
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="badge badge-indigo">{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      ) : (
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px', paddingLeft: '4px' }}>
            Workspace
          </span>
          {globalMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentTab(item.id)} style={navButtonStyle(isActive)}>
                <Icon className="icon-sm" style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-subtle)' }} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {item.count !== undefined && (
                  <span className="badge badge-primary">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Bottom Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
        <button className="btn-secondary" onClick={toggleTheme} style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '7px 12px' }}>
          {isDark ? <SunIcon className="icon-sm" /> : <MoonIcon className="icon-sm" />}
          {isDark ? 'Light Mode' : 'Night Mode'}
        </button>
        <button
          className="btn-secondary"
          onClick={onRefresh}
          disabled={isScanning}
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '7px 12px' }}
        >
          <ArrowPathIcon className={`icon-sm ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning…' : 'Refresh'}
        </button>
      </div>
    </aside>
  );
};
