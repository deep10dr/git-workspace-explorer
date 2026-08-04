import React, { useState } from 'react';
import { WorkingStatus } from '../types';
import { FileEdit, FilePlus, FileX, FileText, Eye } from 'lucide-react';

interface Props {
  status: WorkingStatus;
  repoName: string;
  onViewDiff: (filePath: string) => void;
}

export const WorkingTree: React.FC<Props> = ({ status, repoName, onViewDiff }) => {
  const [filter, setFilter] = useState('');

  if (status.isClean) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-subtle)' }}>
        <FileText size={36} style={{ marginBottom: '12px', opacity: 0.5, color: '#34d399' }} />
        <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '4px' }}>Working Tree Clean</h4>
        <p style={{ fontSize: '0.85rem' }}>No uncommitted changes in <strong>{repoName}</strong></p>
      </div>
    );
  }

  const allFiles = [
    ...status.modifiedFiles.map((f) => ({ path: f, type: 'modified' })),
    ...status.addedFiles.map((f) => ({ path: f, type: 'added' })),
    ...status.deletedFiles.map((f) => ({ path: f, type: 'deleted' })),
    ...status.untrackedFiles.map((f) => ({ path: f, type: 'untracked' })),
  ].filter((f) => f.path.toLowerCase().includes(filter.toLowerCase()));

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'modified': return <span className="badge badge-amber"><FileEdit size={12} /> Modified</span>;
      case 'added': return <span className="badge badge-emerald"><FilePlus size={12} /> Added</span>;
      case 'deleted': return <span className="badge badge-rose"><FileX size={12} /> Deleted</span>;
      case 'untracked': return <span className="badge badge-purple"><FileText size={12} /> Untracked</span>;
      default: return null;
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Working Tree Changes</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Repository: {repoName}</span>
        </div>
        <span className="badge badge-amber">{status.totalChanges} File(s) Changed</span>
      </div>

      {/* File List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
        {allFiles.map((file, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {getTypeBadge(file.type)}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#f3f4f6' }}>{file.path}</span>
            </div>

            <button
              className="btn-secondary"
              onClick={() => onViewDiff(file.path)}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              <Eye size={14} /> View Diff
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
