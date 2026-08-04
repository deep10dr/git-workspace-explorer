import React, { useState, useEffect } from 'react';
import { globalSearch } from '../services/api';
import { SearchResult } from '../types';
import { Search, FolderGit2, GitBranch, GitCommit, Archive, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      globalSearch(query)
        .then((res) => {
          setResults(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'repo': return <FolderGit2 size={16} color="#818cf8" />;
      case 'branch': return <GitBranch size={16} color="#34d399" />;
      case 'commit': return <GitCommit size={16} color="#fbbf24" />;
      case 'stash': return <Archive size={16} color="#c084fc" />;
      default: return <FolderGit2 size={16} color="#818cf8" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '650px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
        }}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <Search size={20} color="var(--text-muted)" />
          <input
            type="text"
            autoFocus
            placeholder="Search repositories, branches, commits, stashes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '1rem',
            }}
          />
          <button onClick={onClose} className="btn-secondary" style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Results Stream */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px 12px' }}>
          {loading && <div style={{ padding: '16px', color: 'var(--text-subtle)', textAlign: 'center' }}>Searching workspace...</div>}
          
          {!loading && query && results.length === 0 && (
            <div style={{ padding: '24px', color: 'var(--text-subtle)', textAlign: 'center' }}>
              No matches found for "{query}"
            </div>
          )}

          {results.map((res, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectResult(res);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                {getIcon(res.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '0.9rem' }}>{res.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{res.subtitle} • {res.snippet}</div>
              </div>
              <span className="badge badge-indigo" style={{ textTransform: 'capitalize' }}>{res.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
