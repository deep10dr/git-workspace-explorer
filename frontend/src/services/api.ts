import { Repository, WorkspaceOverview, Branch, CommitSummary, Stash, SearchResult, VerifyResult } from '../types';

const API_BASE = '/api';

export async function fetchOverview(): Promise<WorkspaceOverview> {
  const res = await fetch(`${API_BASE}/workspace/overview`);
  if (!res.ok) throw new Error('Failed to fetch workspace overview');
  return res.json();
}

export async function fetchRepositories(): Promise<Repository[]> {
  const res = await fetch(`${API_BASE}/repositories`);
  if (!res.ok) throw new Error('Failed to fetch repositories');
  return res.json();
}

export async function fetchRepositoryDetail(id: string): Promise<Repository> {
  const res = await fetch(`${API_BASE}/repositories/${id}`);
  if (!res.ok) throw new Error('Failed to fetch repository details');
  return res.json();
}

export async function fetchBranches(repoId: string): Promise<Branch[]> {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/branches`);
  if (!res.ok) throw new Error('Failed to fetch branches');
  return res.json();
}

export async function fetchCommits(repoId: string): Promise<CommitSummary[]> {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/commits`);
  if (!res.ok) throw new Error('Failed to fetch commits');
  return res.json();
}

export async function fetchCommitFiles(repoId: string, sha: string): Promise<{ path: string; status: string }[]> {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/commits/${sha}/files`);
  if (!res.ok) throw new Error('Failed to fetch commit files');
  return res.json();
}

export async function fetchCommitFileDiff(repoId: string, sha: string, filePath: string): Promise<{ path: string; diff: string }> {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/commits/${sha}/diff?file=${encodeURIComponent(filePath)}`);
  if (!res.ok) throw new Error('Failed to fetch commit file diff');
  return res.json();
}

export async function fetchStashes(repoId: string): Promise<Stash[]> {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/stashes`);
  if (!res.ok) throw new Error('Failed to fetch stashes');
  return res.json();
}

export async function fetchStashFileDiff(repoId: string, stashRef: string, filePath: string): Promise<{ path: string; diff: string }> {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/stashes/${encodeURIComponent(stashRef)}/diff?file=${encodeURIComponent(filePath)}`);
  if (!res.ok) throw new Error('Failed to fetch stash file diff');
  return res.json();
}

export async function fetchFileDiff(repoId: string, filePath: string): Promise<{ path: string; diff: string }> {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/diff?file=${encodeURIComponent(filePath)}`);
  if (!res.ok) throw new Error('Failed to fetch file diff');
  return res.json();
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to execute search');
  return res.json();
}

export async function triggerScan(path?: string): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error('Failed to trigger scan');
  return res.json();
}

export async function verifyCommit(repoId: string, sha: string): Promise<VerifyResult[]> {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/commits/${sha}/verify`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to run commit verification checks');
  return res.json();
}

export async function fetchReadme(repoId: string): Promise<{ exists: boolean; content: string }> {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/readme`);
  if (!res.ok) return { exists: false, content: '' };
  return res.json();
}
