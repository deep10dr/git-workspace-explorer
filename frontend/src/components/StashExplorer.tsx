import React, { useState } from 'react';
import { Stash } from '../types';
import { fetchStashFileDiff } from '../services/api';
import { Archive, Clock, FileCode, Eye, X } from 'lucide-react';

interface Props {
  stashes: Stash[];
  repoName: string;
  repoId: string;
  onInspectFileDiff: (type: 'stash', ref: string, filePath: string, status: string) => void;
}

export const StashExplorer: React.FC<Props> = ({ stashes, repoName, repoId, onInspectFileDiff }) => {
  const [selectedStash, setSelectedStash] = useState<Stash | null>(stashes[0] || null);

  if (stashes.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-subtle)' }}>
        <Archive size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
        <p>No stashes found in repository <strong>{repoName}</strong></p>
      </div>
    );
  }

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '420px', overflowY: 'auto' }}>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                Files in Stash #{selectedStash.index}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                {selectedStash.message}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedStash.files.map((file, idx) => (
                <div
                  key={idx}
                  onClick={() => onInspectFileDiff('stash', selectedStash.ref, file.path, file.status)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    padding: '8px 10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  className="btn-secondary-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={14} color="var(--accent-secondary)" />
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontSize: '0.78rem' }}>{file.path}</span>
                  </div>
                  <span className="badge badge-amber">{file.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
