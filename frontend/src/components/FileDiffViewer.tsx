import React, { useEffect, useState } from 'react';
import { fetchFileDiff } from '../services/api';
import { FileCode, X, Plus, Minus } from 'lucide-react';

interface Props {
  repoId: string;
  filePath: string;
  onClose: () => void;
}

export const FileDiffViewer: React.FC<Props> = ({ repoId, filePath, onClose }) => {
  const [diffText, setDiffText] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchFileDiff(repoId, filePath)
      .then((data) => {
        if (isMounted) {
          setDiffText(data.diff);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [repoId, filePath]);

  const lines = diffText.split('\n');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '900px',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCode size={18} color="#818cf8" />
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{filePath}</span>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Diff Content */}
        <div style={{ flex: 1, padding: '16px', overflow: 'auto', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
          {loading ? (
            <div style={{ padding: '20px', color: 'var(--text-subtle)' }}>Loading diff...</div>
          ) : (
            lines.map((line, idx) => {
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
                bg = 'rgba(99, 102, 241, 0.06)';
                color = 'var(--accent-primary)';
                symbol = '@';
              } else if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff') || line.startsWith('index')) {
                bg = 'rgba(100, 116, 139, 0.04)';
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
                    fontSize: '0.825rem',
                    lineHeight: '1.45',
                    padding: '2px 0',
                    borderLeft: symbol === '+' ? '3px solid var(--accent-emerald)' : symbol === '-' ? '3px solid var(--accent-rose)' : '3px solid transparent',
                  }}
                >
                  <span style={{ width: '40px', textAlign: 'right', paddingRight: '8px', color: 'var(--text-subtle)', userSelect: 'none', borderRight: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                    {idx + 1}
                  </span>
                  <span style={{ width: '20px', textAlign: 'center', userSelect: 'none', fontWeight: 'bold', fontSize: '0.75rem' }}>
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
      </div>
    </div>
  );
};
