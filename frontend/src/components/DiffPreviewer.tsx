import React, { useEffect, useState } from 'react';
import { fetchCommitFileDiff, fetchStashFileDiff } from '../services/api';
import { XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

export interface DiffTab {
  repoId: string;
  type: 'commit' | 'stash';
  ref: string; // Commit SHA or Stash ref
  filePath: string;
  status: string;
}

interface Props {
  tabs: DiffTab[];
  activeTabIndex: number;
  onSelectTab: (index: number) => void;
  onCloseTab: (index: number) => void;
}

export const DiffPreviewer: React.FC<Props> = ({
  tabs,
  activeTabIndex,
  onSelectTab,
  onCloseTab,
}) => {
  const activeTab = tabs[activeTabIndex];
  const [diffText, setDiffText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTab) return;

    setLoading(true);
    setError(null);
    setDiffText('');

    const fetchDiff = activeTab.type === 'commit'
      ? fetchCommitFileDiff(activeTab.repoId, activeTab.ref, activeTab.filePath)
      : fetchStashFileDiff(activeTab.repoId, activeTab.ref, activeTab.filePath);

    fetchDiff
      .then((data) => {
        setDiffText(data.diff);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load file diff:', err);
        setError('Failed to load file diff.');
        setLoading(false);
      });
  }, [activeTab]);

  if (tabs.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>
        <DocumentIcon className="icon-lg" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
        <p>No preview tabs open. Click a file in Commit or Stash details to inspect.</p>
      </div>
    );
  }

  // Calculate metrics (Additions/Deletions)
  const lines = diffText.split('\n');
  const additions = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
  const deletions = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('add') || s === 'a') return <span className="badge badge-emerald">ADDED</span>;
    if (s.includes('del') || s === 'd') return <span className="badge badge-rose">DELETED</span>;
    return <span className="badge badge-amber">MODIFIED</span>;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '80vh', overflow: 'hidden' }}>
      {/* File Tabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        overflowX: 'auto',
        padding: '0 8px',
      }}>
        {tabs.map((tab, idx) => {
          const isActive = idx === activeTabIndex;
          const fileName = tab.filePath.split('/').pop() || tab.filePath;
          return (
            <div
              key={idx}
              onClick={() => onSelectTab(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRight: '1px solid var(--border-color)',
                background: isActive ? 'var(--bg-primary)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 450,
                color: isActive ? 'var(--text-heading)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                {fileName}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(idx);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '2px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'var(--text-subtle)',
                }}
                className="btn-secondary-hover"
              >
                <XMarkIcon style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* active tab details panel */}
      {activeTab && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Summary Panel */}
          <div style={{
            padding: '14px 20px',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {getStatusBadge(activeTab.status)}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-heading)',
              }}>
                {activeTab.filePath}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Source: <strong style={{ color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>{activeTab.type === 'commit' ? 'Commit' : 'Stash'} ({activeTab.ref.substring(0, 7)})</strong>
              </span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>+{additions} additions</span>
              <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>-{deletions} deletions</span>
            </div>
          </div>

          {/* Diff Editor Pane */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            background: 'var(--bg-primary)',
            padding: '16px',
          }}>
            {loading ? (
              <div style={{ color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', padding: '12px' }}>
                Loading diff preview...
              </div>
            ) : error ? (
              <div style={{ color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', padding: '12px' }}>
                {error}
              </div>
            ) : (
              lines.map((line, idx) => {
                let bg = 'transparent';
                let color = 'var(--text-main)';
                let symbol = ' ';

                if (line.startsWith('+') && !line.startsWith('+++')) {
                  bg = 'rgba(74, 222, 128, 0.08)';
                  color = 'var(--accent-emerald)';
                  symbol = '+';
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  bg = 'rgba(251, 113, 133, 0.08)';
                  color = 'var(--accent-rose)';
                  symbol = '-';
                } else if (line.startsWith('@@')) {
                  bg = 'rgba(20, 184, 166, 0.06)';
                  color = 'var(--accent-primary)';
                  symbol = '@';
                } else if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff') || line.startsWith('index')) {
                  bg = 'rgba(113, 113, 122, 0.04)';
                  color = 'var(--text-subtle)';
                  symbol = 'i';
                }

                const codeText = (line.startsWith('+') || line.startsWith('-') || line.startsWith(' ')) ? line.substring(1) : line;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      background: bg,
                      color: color,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      lineHeight: '1.45',
                      padding: '2px 0',
                      borderLeft: symbol === '+' ? '3px solid var(--accent-emerald)' : symbol === '-' ? '3px solid var(--accent-rose)' : '3px solid transparent',
                    }}
                  >
                    <span style={{
                      width: '44px',
                      textAlign: 'right',
                      paddingRight: '10px',
                      color: 'var(--text-subtle)',
                      userSelect: 'none',
                      borderRight: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{
                      width: '24px',
                      textAlign: 'center',
                      userSelect: 'none',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                    }}>
                      {symbol !== ' ' && symbol !== 'i' ? symbol : ''}
                    </span>
                    <pre style={{
                      margin: 0,
                      paddingLeft: '6px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      flex: 1,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {codeText}
                    </pre>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
