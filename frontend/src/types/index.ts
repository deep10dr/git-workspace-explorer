export interface Repository {
  id: string;
  name: string;
  path: string;
  currentBranch: string;
  isDetached: boolean;
  headSha: string;
  lastCommit?: CommitSummary;
  status: WorkingStatus;
  stashCount: number;
  aheadCount: number;
  behindCount: number;
  lastActivity: string;
  health: HealthReport;
}

export interface CommitSummary {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  email: string;
  timestamp: string;
  parentShas?: string[];
  refs?: string[];
}

export interface WorkingStatus {
  isClean: boolean;
  modifiedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  renamedFiles: string[];
  untrackedFiles: string[];
  totalChanges: number;
}

export interface HealthReport {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  hasUncommittedWork: boolean;
  hasUnpushedCommits: boolean;
  hasRebaseOrMerge: boolean;
  isDetachedHead: boolean;
  staleBranchCount: number;
  oldStashCount: number;
}

export interface Branch {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  lastCommit: string;
  lastCommitSha: string;
  author: string;
  lastCheckout: string;
  ahead: number;
  behind: number;
  isMerged: boolean;
  upstream?: string;
}

export interface Stash {
  index: number;
  ref: string;
  branchName: string;
  message: string;
  timestamp: string;
  files: StashFile[];
  isFavorite: boolean;
  tags: string[];
  userNote: string;
}

export interface StashFile {
  path: string;
  status: string;
}

export interface WorkspaceOverview {
  totalRepositories: number;
  cleanRepositories: number;
  dirtyRepositories: number;
  totalBranches: number;
  totalStashes: number;
  unpushedCommits: number;
  warningIssues: number;
}

export interface SearchResult {
  type: 'repo' | 'branch' | 'commit' | 'stash' | 'file';
  repositoryId: string;
  repositoryName: string;
  title: string;
  subtitle: string;
  ref: string;
  snippet: string;
}

export interface VerifyResult {
  name: string;
  status: 'success' | 'failure' | 'skipped';
  message: string;
  output: string;
}
