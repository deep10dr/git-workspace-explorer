import React, { useState } from 'react';
import { Stash } from '../types';
import { fetchStashFileDiff } from '../services/api';
import { Archive, Clock, FileCode, Eye, X } from 'lucide-react';

interface Props {
  stashes: Stash[];
  repoName: string;
  repoId: string;
}

export const StashExplorer: React.FC<Props> = ({ stashes, repoName, repoId }) => {
  const [selectedStash, setSelectedStash] = useState<Stash | null>(stashes[0] || null);
  const [activeDiffFile, setActiveDiffFile] = useState<string | null>(null);
  const [activeDiffText, setActiveDiffText] = useState<string>('');
  const [loadingDiff, setLoadingDiff] = useState(false);

  if (stashes.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-subtle)' }}>
        <Archive size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
        <p>No stashes found in repository <strong>{repoName}</strong></p>
      </div>
    );
  }

  const handleInspectStashDiff = (stashRef: string, filePath: string) => {
    setActiveDiffFile(filePath);
    setLoadingDiff(true);
    fetchStashFileDiff(repoId, stashRef, filePath)
      .then((res) => {
        setActiveDiffText(res.diff);
        setLoadingDiff(false);
      })
      .catch(() => {
        setActiveDiffText('Error loading stash diff.');
        setLoadingDiff(false);
      });
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Stash Explorer & Diff Inspector</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Repository: {repoName}</span>
        </div>
        <span className="badge badge-purple">{stashes.length} Stash(es)</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Stash List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
          {stashes.map((stash) => {
            const isSelected = selectedStash?.ref === stash.ref;
            return (
              <div
                key={stash.ref}
                onClick={() => {
                  setSelectedStash(stash);
                  setActiveDiffFile(null);
                }}
                style={{
                  padding: '12px 14px',
                  background: isSelected ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255,255,255,0.02)',
                  border: isSelected ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e7eb' }}>
                    Stash #{stash.index} ({stash.ref})
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    <Clock size={12} /> {new Date(stash.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {stash.message}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stash File Breakdown & Diff Viewer */}
        {selectedStash && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', maxHeight: '420px', overflowY: 'auto' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                Files in Stash #{selectedStash.index}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                {selectedStash.message}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedStash.files.map((file, idx) => (
                <div
                  key={idx}
                  onClick={() => handleInspectStashDiff(selectedStash.ref, file.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    padding: '8px 10px',
                    background: activeDiffFile === file.path ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.03)',
                    border: activeDiffFile === file.path ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={14} color="#c084fc" />
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#d1d5db' }}>{file.path}</span>
                  </div>
                  <span className="badge badge-amber">{file.status}</span>
                </div>
              ))}
            </div>

            {/* Inline Diff Panel */}
            {activeDiffFile && (
              <div style={{ marginTop: '8px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', maxHeight: '220px', overflow: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                  <span style={{ color: '#c084fc', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{activeDiffFile}</span>
                  <button onClick={() => setActiveDiffFile(null)} className="btn-secondary" style={{ padding: '2px 4px' }}>
                    <X size={12} />
                  </button>
                </div>
                {loadingDiff ? (
                  <div style={{ color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Loading stash diff...</div>
                ) : (
                  activeDiffText.split('\n').map((line, lIdx) => {
                    let bg = 'transparent';
                    let color = 'var(--text-main)';
                    let symbol = ' ';

                    if (line.startsWith('+') && !line.startsWith('+++')) {
                      bg = 'rgba(16, 185, 129, 0.08)';
                      color = 'var(--accent-emerald)';
                      symbol = '+';
                    } else if (line.startsWith('-') && !line.startsWith('---')) {
                      bg = 'rgba(244, 63, 94, 0.08)';
                      color = 'var(--accent-rose)';
                      symbol = '-';
                    } else if (line.startsWith('@@')) {
                      bg = 'rgba(168, 85, 247, 0.06)';
                      color = 'var(--accent-purple)';
                      symbol = '@';
                    } else if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff') || line.startsWith('index')) {
                      bg = 'rgba(100, 116, 139, 0.04)';
                      color = 'var(--text-subtle)';
                      symbol = 'i';
                    }

                    const codeText = (line.startsWith('+') || line.startsWith('-') || line.startsWith(' ')) ? line.substring(1) : line;

                    return (
                      <div
                        key={lIdx}
                        style={{
                          display: 'flex',
                          background: bg,
                          color: color,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          lineHeight: '1.4',
                          padding: '1px 0',
                          borderLeft: symbol === '+' ? '3px solid var(--accent-emerald)' : symbol === '-' ? '3px solid var(--accent-rose)' : '3px solid transparent',
                        }}
                      >
                        <span style={{ width: '30px', textAlign: 'right', paddingRight: '6px', color: 'var(--text-subtle)', userSelect: 'none', borderRight: '1px solid var(--border-color)', fontSize: '0.7rem' }}>
                          {lIdx + 1}
                        </span>
                        <span style={{ width: '16px', textAlign: 'center', userSelect: 'none', fontWeight: 'bold', fontSize: '0.7rem' }}>
                          {symbol !== ' ' && symbol !== 'i' ? symbol : ''}
                        </span>
                        <pre style={{ margin: 0, paddingLeft: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', flex: 1, fontFamily: 'var(--font-mono)' }}>
                          {codeText}
                        </pre>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
