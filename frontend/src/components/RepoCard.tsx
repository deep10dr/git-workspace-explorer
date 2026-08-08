import React from 'react';
import { Repository } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  ArrowUp, 
  ArrowDown, 
  Archive,
  GitBranch 
} from 'lucide-react';

interface Props {
  repo: Repository;
  onSelect: (repo: Repository) => void;
}

export const RepoCard: React.FC<Props> = ({ repo, onSelect }) => {
  const getHealthBadge = () => {
    if (repo.health.status === 'healthy') {
      return <span className="badge badge-emerald"><ShieldCheck size={14} /> Healthy</span>;
    }
    if (repo.health.status === 'warning') {
      return <span className="badge badge-amber"><AlertTriangle size={14} /> {repo.health.issues.length} Issue(s)</span>;
    }
    return <span className="badge badge-rose"><AlertTriangle size={14} /> Critical</span>;
  };

  return (
    <div
      className="glass-panel animate-fade-in"
      onClick={() => onSelect(repo)}
      style={{
        padding: '18px 20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>{repo.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {getHealthBadge()}
          <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
        </div>
      </div>

      {/* Branch & Path */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          <GitBranch size={14} />
          <span>{repo.currentBranch}</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-mono)' }}>
          {repo.path}
        </span>
      </div>

      {/* Last Commit */}
      {repo.lastCommit && (
        <div style={{
          background: 'var(--bg-tertiary)', padding: '9px 11px',
          borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
          color: 'var(--text-muted)', border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontWeight: 500, color: 'var(--text-main)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
            {repo.lastCommit.message}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
            {repo.lastCommit.author} · {new Date(repo.lastCommit.timestamp).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Footer Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FileText size={14} style={{ color: repo.status.isClean ? 'var(--text-subtle)' : 'var(--accent-amber)' }} />
          <span style={{ color: repo.status.isClean ? 'var(--text-subtle)' : 'var(--accent-amber)' }}>
            {repo.status.isClean ? 'Clean' : `${repo.status.totalChanges} changes`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {repo.aheadCount > 0 && (
            <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUp size={14} /> {repo.aheadCount}
            </span>
          )}
          {repo.behindCount > 0 && (
            <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowDown size={14} /> {repo.behindCount}
            </span>
          )}
          {repo.stashCount > 0 && (
            <span className="badge badge-primary">
              <Archive size={14} /> {repo.stashCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
