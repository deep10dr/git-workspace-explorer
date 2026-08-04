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
import { fetchOverview, fetchRepositories, fetchBranches, fetchCommits, fetchStashes, triggerScan } from './services/api';
import { Repository, WorkspaceOverview, Branch, CommitSummary, Stash, SearchResult } from './types';
import { FolderGit2, Search, AlertTriangle, ShieldCheck, FileEdit, RefreshCw, FolderPlus, ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
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

      {/* Main Content View */}
      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
        {/* Workspace Header & Paste Workspace Folder Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              {selectedRepo ? selectedRepo.name : 'Local Git Workspace'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
              {selectedRepo ? selectedRepo.path : `Monitoring ${repositories.length} local repositories`}
            </span>
          </div>

          {!selectedRepo && (
            <form onSubmit={handleScanPath} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '500px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FolderPlus size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--accent-primary)' }} />
                <input
                  type="text"
                  placeholder="Paste workspace folder path (e.g. /Users/deepak/Projects)..."
                  value={workspaceInputPath}
                  onChange={(e) => setWorkspaceInputPath(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px 8px 34px',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={isScanning} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
                Scan Folder
              </button>
            </form>
          )}

          {/* Quick Filter Input */}
          {!selectedRepo && (
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Filter repositories..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px 8px 34px',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                }}
              />
            </div>
          )}
        </div>

        {/* Level 1: Global Workspace Dashboard */}
        {!selectedRepo && overview && <WorkspaceStats overview={overview} />}

        {!selectedRepo ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Discovered Repositories</h3>
              <span className="badge badge-indigo">{filteredRepos.length} Repositories</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredRepos.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  onSelect={(r) => {
                    setSelectedRepo(r);
                    setCurrentTab('graph');
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Level 2: Repository Detail Workspace View */
          <div>
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
