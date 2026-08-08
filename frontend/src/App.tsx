import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkspaceStats } from './components/WorkspaceStats';
import { RepoCard } from './components/RepoCard';
import { BranchExplorer } from './components/BranchExplorer';
import { CommitGraph } from './components/CommitGraph';
import { StashExplorer } from './components/StashExplorer';
import { WorkingTree } from './components/WorkingTree';
import { FileDiffViewer } from './components/FileDiffViewer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { DiffPreviewer, DiffTab } from './components/DiffPreviewer';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { ActivityFeedView } from './components/ActivityFeedView';
import { RepoOverview } from './components/RepoOverview';
import { TestRunnerView } from './components/TestRunnerView';
import { fetchOverview, fetchRepositories, fetchBranches, fetchCommits, fetchStashes, triggerScan } from './services/api';
import { Repository, WorkspaceOverview, Branch, CommitSummary, Stash, SearchResult } from './types';
import { FolderGit2, Search, AlertTriangle, ShieldCheck, FileEdit, RefreshCw, FolderPlus, ArrowLeft, LayoutList, Grid, GitBranch, ChevronRight } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [overview, setOverview] = useState<WorkspaceOverview | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [commits, setCommits] = useState<CommitSummary[]>([]);
  const [stashes, setStashes] = useState<Stash[]>([]);
  
  const [workspaceInputPath, setWorkspaceInputPath] = useState('/Users/deepak/Projects');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedDiffFile, setSelectedDiffFile] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Tabbed File Previews workspace states
  const [diffTabs, setDiffTabs] = useState<DiffTab[]>([]);
  const [activeDiffTabIndex, setActiveDiffTabIndex] = useState<number>(0);

  const handleInspectFileDiff = (type: 'commit' | 'stash', ref: string, filePath: string, status: string) => {
    if (!selectedRepo) return;
    const existingIndex = diffTabs.findIndex(
      (t) => t.repoId === selectedRepo.id && t.type === type && t.ref === ref && t.filePath === filePath
    );

    if (existingIndex !== -1) {
      setActiveDiffTabIndex(existingIndex);
    } else {
      const newTab: DiffTab = { repoId: selectedRepo.id, type, ref, filePath, status };
      setDiffTabs((prev) => [...prev, newTab]);
      setActiveDiffTabIndex(diffTabs.length);
    }
    setCurrentTab('previews');
  };

  const handleCloseDiffTab = (index: number) => {
    setDiffTabs((prev) => {
      const nextTabs = prev.filter((_, i) => i !== index);
      if (activeDiffTabIndex >= nextTabs.length) {
        setActiveDiffTabIndex(Math.max(0, nextTabs.length - 1));
      }
      return nextTabs;
    });
  };

  const loadData = async () => {
    try {
      const [ov, repos] = await Promise.all([fetchOverview(), fetchRepositories()]);
      setOverview(ov);
      setRepositories(repos || []);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      fetchBranches(selectedRepo.id).then(setBranches).catch(() => setBranches([]));
      fetchCommits(selectedRepo.id).then(setCommits).catch(() => setCommits([]));
      fetchStashes(selectedRepo.id).then(setStashes).catch(() => setStashes([]));
    }
  }, [selectedRepo]);

  // Global ⌘K Keyboard Shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScanPath = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsScanning(true);
    await triggerScan(workspaceInputPath);
    await loadData();
    setIsScanning(false);
  };

  const handleRefresh = async () => {
    setIsScanning(true);
    await triggerScan();
    await loadData();
    setIsScanning(false);
  };

  const handleBackToWorkspace = () => {
    setSelectedRepo(null);
    setCurrentTab('dashboard');
  };

  const filteredRepos = repositories.filter((r) =>
    r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.path.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.currentBranch.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleSelectSearchResult = (res: SearchResult) => {
    const targetRepo = repositories.find((r) => r.id === res.repositoryId);
    if (targetRepo) {
      setSelectedRepo(targetRepo);
      if (res.type === 'branch') setCurrentTab('branches');
      else if (res.type === 'commit') setCurrentTab('graph');
      else if (res.type === 'stash') setCurrentTab('stashes');
      else setCurrentTab('graph');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedRepo={selectedRepo}
        onBackToWorkspace={handleBackToWorkspace}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRefresh={handleRefresh}
        isScanning={isScanning}
        totalRepos={repositories.length}
        openPreviewsCount={diffTabs.length}
      />

      {/* Main Content Area (Scrollable Viewport) */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', overflowX: 'hidden', padding: '24px 32px' }}>

        {/* Settings & About Views */}
        {currentTab === 'settings' && (
          <SettingsView
            workspacePath={workspaceInputPath}
            onUpdatePath={async (newPath) => {
              setWorkspaceInputPath(newPath);
              setIsScanning(true);
              await triggerScan(newPath);
              await loadData();
              setIsScanning(false);
            }}
            isScanning={isScanning}
            totalRepos={repositories.length}
          />
        )}

        {currentTab === 'about' && (
          <AboutView
            totalRepos={repositories.length}
            workspacePath={workspaceInputPath}
          />
        )}

        {currentTab === 'activity' && (
          <ActivityFeedView
            repositories={repositories}
            onSelectRepo={(r) => {
              setSelectedRepo(r);
              setCurrentTab('overview');
            }}
          />
        )}

        {/* 1. Dashboard Tab View */}
        {!selectedRepo && currentTab === 'dashboard' && (
          <>
            {overview && <WorkspaceStats overview={overview} />}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>Workspace Repositories Overview</h3>
                <span className="badge badge-indigo">{filteredRepos.length} Repositories</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredRepos.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    onSelect={(r) => {
                      setSelectedRepo(r);
                      setCurrentTab('overview');
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* 2. Repositories Tab (Master-Detail Table List View) */}
        {!selectedRepo && currentTab === 'repositories' && (
          <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>Repositories List</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', margin: 0, marginTop: '4px' }}>Click any repository row below to inspect its commit graph, branches, and status.</p>
              </div>
              <span className="badge badge-indigo">{filteredRepos.length} Repositories</span>
            </div>

            <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: 0, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '12px 16px' }}>Repository Name</th>
                    <th style={{ padding: '12px 16px' }}>Branch</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Health</th>
                    <th style={{ padding: '12px 16px' }}>Last Commit</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRepos.map((repo) => (
                    <tr
                      key={repo.id}
                      onClick={() => {
                        setSelectedRepo(repo);
                        setCurrentTab('overview');
                      }}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {repo.name}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', fontWeight: 400, marginTop: '2px' }}>
                          {repo.path}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <GitBranch size={13} /> {repo.currentBranch}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${repo.status.isClean ? 'badge-emerald' : 'badge-amber'}`}>
                          {repo.status.isClean ? 'Clean' : `${repo.status.totalChanges} changes`}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${repo.health.status === 'healthy' ? 'badge-emerald' : 'badge-amber'}`}>
                          {repo.health.score}/100 ({repo.health.status})
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {repo.lastCommit ? repo.lastCommit.message : 'No commits'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Level 2: Repository Detail Workspace View */}
        {selectedRepo && currentTab !== 'settings' && currentTab !== 'about' && (
          <div>
            {currentTab === 'overview' && (
              <RepoOverview repo={selectedRepo} />
            )}
            {currentTab === 'testing' && (
              <TestRunnerView repoId={selectedRepo.id} repoName={selectedRepo.name} headSha={selectedRepo.headSha} />
            )}
            {currentTab === 'graph' && (
              <CommitGraph commits={commits} repoName={selectedRepo.name} repoId={selectedRepo.id} onInspectFileDiff={handleInspectFileDiff} />
            )}
            {currentTab === 'branches' && (
              <BranchExplorer branches={branches} repoName={selectedRepo.name} />
            )}
            {currentTab === 'stashes' && (
              <StashExplorer stashes={stashes} repoName={selectedRepo.name} repoId={selectedRepo.id} onInspectFileDiff={handleInspectFileDiff} />
            )}
            {currentTab === 'previews' && (
              <DiffPreviewer tabs={diffTabs} activeTabIndex={activeDiffTabIndex} onSelectTab={setActiveDiffTabIndex} onCloseTab={handleCloseDiffTab} />
            )}
            {currentTab === 'changes' && (
              <WorkingTree status={selectedRepo.status} repoName={selectedRepo.name} onViewDiff={(path) => setSelectedDiffFile(path)} />
            )}
            {currentTab === 'health' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-heading)' }}>Health Diagnostics: {selectedRepo.name}</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedRepo.health.status === 'healthy' ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginBottom: '16px' }}>
                  Score: {selectedRepo.health.score} / 100 ({selectedRepo.health.status.toUpperCase()})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedRepo.health.issues.length === 0 ? (
                    <div className="badge badge-emerald" style={{ padding: '8px 12px' }}>No health issues detected.</div>
                  ) : (
                    selectedRepo.health.issues.map((issue, idx) => (
                      <div key={idx} className="badge badge-amber" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                        ⚠️ {issue}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* File Diff Modal */}
      {selectedRepo && selectedDiffFile && (
        <FileDiffViewer
          repoId={selectedRepo.id}
          filePath={selectedDiffFile}
          onClose={() => setSelectedDiffFile(null)}
        />
      )}

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />
    </div>
  );
};
