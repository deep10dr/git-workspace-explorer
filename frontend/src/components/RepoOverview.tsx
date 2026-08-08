import React, { useEffect, useState } from 'react';
import { Repository } from '../types';
import { fetchReadme } from '../services/api';
import { LanguageBar } from './LanguageBar';
import { ReadmeViewer } from './ReadmeViewer';
import { 
  User, 
  Clock, 
  Sparkles, 
  FileText,
  ShieldCheck,
  AlertTriangle,
  GitBranch
} from 'lucide-react';

interface Props {
  repo: Repository;
}

const FUNNY_TAGLINES = [
  "98% Pure code: Remember to drink water while your build runs!",
  "Zero uncommitted changes: You are a rare developer who actually commits code!",
  "Clean working tree: May your code compile on the very first try!",
  "0 Syntax Errors detected: Ship it straight to production on a Friday!",
  "High concurrency workspace: Fueled by coffee and stackoverflow threads!",
];

export const RepoOverview: React.FC<Props> = ({ repo }) => {
  const [readme, setReadme] = useState<{ exists: boolean; content: string }>({ exists: false, content: '' });
  const [loadingReadme, setLoadingReadme] = useState<boolean>(true);
  const [funnyTagline] = useState<string>(() => {
    const idx = Math.abs(repo.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % FUNNY_TAGLINES.length;
    return FUNNY_TAGLINES[idx];
  });

  useEffect(() => {
    setLoadingReadme(true);
    fetchReadme(repo.id)
      .then((res) => {
        setReadme(res);
        setLoadingReadme(false);
      })
      .catch(() => {
        setReadme({ exists: false, content: '' });
        setLoadingReadme(false);
      });
  }, [repo.id]);

  const lastCommitDate = repo.lastCommit ? new Date(repo.lastCommit.timestamp).toLocaleString() : 'N/A';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Funny Developer Tagline Banner */}
      <div className="glass-panel" style={{
        padding: '14px 18px',
        background: 'linear-gradient(90deg, rgba(20, 184, 166, 0.12), rgba(96, 165, 250, 0.08))',
        border: '1px solid rgba(20, 184, 166, 0.25)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <Sparkles size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>
          {funnyTagline}
        </span>
      </div>

      {/* Repository Metadata & Language Range Bar Card */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Author / Maintainer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <User size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Author</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                {repo.lastCommit?.author || 'Git Explorer'}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <Clock size={18} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Last Commit</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                {lastCommitDate}
              </div>
            </div>
          </div>

          {/* Active Branch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(45, 212, 191, 0.1)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <GitBranch size={18} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Branch</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                {repo.currentBranch}
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: repo.health.status === 'healthy' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              {repo.health.status === 'healthy' ? (
                <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
              ) : (
                <AlertTriangle size={18} style={{ color: 'var(--accent-amber)' }} />
              )}
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Health Score</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: repo.health.status === 'healthy' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {repo.health.score} / 100 ({repo.health.status.toUpperCase()})
              </div>
            </div>
          </div>
        </div>

        {/* Languages Single Range Bar */}
        {repo.languages && repo.languages.length > 0 && (
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
              Languages Breakdown
            </span>
            <LanguageBar languages={repo.languages} />
          </div>
        )}
      </div>

      {/* README Section */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            README.md
          </h3>
        </div>

        {loadingReadme ? (
          <div style={{ padding: '20px', color: 'var(--text-subtle)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
            Loading README content...
          </div>
        ) : readme.exists ? (
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            maxHeight: '550px',
            overflowY: 'auto',
          }}>
            <ReadmeViewer content={readme.content} />
          </div>
        ) : (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: 'var(--text-subtle)',
            fontSize: '0.82rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
          }}>
            No README.md file found in this repository.
          </div>
        )}
      </div>
    </div>
  );
};
