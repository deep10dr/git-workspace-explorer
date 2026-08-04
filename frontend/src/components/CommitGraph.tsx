import React, { useState, useEffect, useMemo } from 'react';
import { CommitSummary } from '../types';
import { fetchCommitFiles, fetchCommitFileDiff } from '../services/api';
import { ReactFlow, Background, Controls, Node, Edge, Position, MarkerType, useNodesState, useEdgesState } from '@xyflow/react';
import { User, Calendar, Tag, Search, FileCode, X } from 'lucide-react';
import '@xyflow/react/dist/style.css';

interface Props {
  commits: CommitSummary[];
  repoName: string;
  repoId: string;
}

export const CommitGraph: React.FC<Props> = ({ commits, repoName, repoId }) => {
  const [filter, setFilter] = useState('');
  const [selectedCommit, setSelectedCommit] = useState<CommitSummary | null>(commits[0] || null);
  const [commitFiles, setCommitFiles] = useState<{ path: string; status: string }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [activeDiffFile, setActiveDiffFile] = useState<string | null>(null);
  const [activeDiffText, setActiveDiffText] = useState<string>('');
  const [loadingDiff, setLoadingDiff] = useState(false);

  // React Flow state hooks for draggable nodes
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Fetch changed files for selected commit
  useEffect(() => {
    if (selectedCommit) {
      setLoadingFiles(true);
      setActiveDiffFile(null);
      fetchCommitFiles(repoId, selectedCommit.sha)
        .then((files) => {
          setCommitFiles(files || []);
          setLoadingFiles(false);
        })
        .catch(() => {
          setCommitFiles([]);
          setLoadingFiles(false);
        });
    }
  }, [selectedCommit, repoId]);

  const handleInspectFileDiff = (filePath: string) => {
    if (!selectedCommit) return;
    setActiveDiffFile(filePath);
    setLoadingDiff(true);
    fetchCommitFileDiff(repoId, selectedCommit.sha, filePath)
      .then((res) => {
        setActiveDiffText(res.diff);
        setLoadingDiff(false);
      })
      .catch(() => {
        setActiveDiffText('Error fetching diff text.');
        setLoadingDiff(false);
      });
  };

  const filteredCommits = useMemo(() => {
    return commits.filter(
      (c) =>
        c.message.toLowerCase().includes(filter.toLowerCase()) ||
        c.author.toLowerCase().includes(filter.toLowerCase()) ||
        c.shortSha.toLowerCase().includes(filter.toLowerCase())
    );
  }, [commits, filter]);

  // Compute initial node positions
  const computeNodesAndEdges = () => {
    const nodesList: Node[] = [];
    const edgesList: Edge[] = [];
    const shaToRow: Record<string, number> = {};

    filteredCommits.forEach((c, idx) => {
      shaToRow[c.sha] = idx;
    });

    const activeColumns: string[] = [];

    filteredCommits.forEach((commit, rowIdx) => {
      let colIdx = activeColumns.indexOf(commit.sha);
      if (colIdx === -1) {
        colIdx = activeColumns.findIndex((sha) => sha === '');
        if (colIdx === -1) {
          colIdx = activeColumns.length;
          activeColumns.push(commit.sha);
        } else {
          activeColumns[colIdx] = commit.sha;
        }
      }

      let bgColor = 'var(--accent-amber)';
      let shadowGlow = '0 0 8px rgba(251, 191, 36, 0.2)';

      if (rowIdx === 0) {
        bgColor = 'var(--accent-emerald)';
        shadowGlow = '0 0 12px rgba(52, 211, 153, 0.3)';
      } else if (commit.parentShas && commit.parentShas.length > 1) {
        bgColor = 'var(--accent-orange)';
        shadowGlow = '0 0 8px rgba(251, 146, 60, 0.2)';
      }

      nodesList.push({
        id: commit.sha,
        type: 'default',
        draggable: true,
        data: {
          label: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left', fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-secondary)' }}>{commit.shortSha}</span>
                {commit.refs && commit.refs.slice(0, 2).map((ref, rIdx) => (
                  <span key={rIdx} style={{ fontSize: '0.6rem', background: 'var(--bg-input)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    {ref}
                  </span>
                ))}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                {commit.message}
              </div>
            </div>
          ),
          commit,
        },
        position: {
          x: colIdx * 150 + 50,
          y: rowIdx * 100 + 40,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-main)',
          border: `2px solid ${bgColor}`,
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          width: 210,
          boxShadow: shadowGlow,
        },
      });

      if (commit.parentShas) {
        commit.parentShas.forEach((parentSha, parentIdx) => {
          if (shaToRow[parentSha] !== undefined) {
            const edgeColor = parentIdx > 0 ? '#f59e0b' : '#6366f1';
            edgesList.push({
              id: `${commit.sha}->${parentSha}`,
              source: commit.sha,
              target: parentSha,
              animated: parentIdx > 0,
              style: { stroke: edgeColor, strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 14,
                height: 14,
                color: edgeColor,
              },
            });

            if (parentIdx === 0) {
              activeColumns[colIdx] = parentSha;
            }
          }
        });
      }

      if (activeColumns[colIdx] === commit.sha) {
        activeColumns[colIdx] = '';
      }
    });

    return { nodes: nodesList, edges: edgesList };
  };

  // Sync state whenever filter or commits change
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = computeNodesAndEdges();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [filteredCommits]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    const commit = node.data.commit as CommitSummary;
    if (commit) setSelectedCommit(commit);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedCommit ? '1fr 420px' : '1fr', gap: '20px', height: '80vh' }}>
      {/* Left Panel: React Flow Board */}
      <div className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Interactive Commit Node Graph</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Repository: {repoName}</span>
          </div>

          {/* Color Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }} /> HEAD
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-orange)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)' }} /> Merged
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }} /> Unmerged
            </span>
          </div>
        </div>

        {/* Filter Input */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Filter commits..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '8px 12px 8px 34px',
              color: '#ffffff',
              fontSize: '0.85rem',
            }}
          />
        </div>

        {/* React Flow Board */}
        <div style={{ flex: 1, position: 'relative', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={1.5}
          >
            <Background color="rgba(100,116,139,0.1)" gap={16} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>

      {/* Right Column: Node Details & File Diff Inspector */}
      {selectedCommit && (
        <div className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '100%', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>Commit Details</h4>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-secondary)' }}>{selectedCommit.sha}</span>
            </div>
            <button onClick={() => setSelectedCommit(null)} className="btn-secondary" style={{ padding: '4px 8px' }}>
              <X size={16} />
            </button>
          </div>

          {/* Details Card */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.9rem' }}>{selectedCommit.message}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Author: <strong>{selectedCommit.author}</strong> ({selectedCommit.email})
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              Date: {new Date(selectedCommit.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Changed Files Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-heading)' }}>Changed Files</h5>
            <span className="badge badge-indigo">{commitFiles.length} File(s)</span>
          </div>

          {/* Changed Files List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {loadingFiles ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>Loading files...</div>
            ) : commitFiles.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>No file changes recorded.</div>
            ) : (
              commitFiles.map((file, idx) => (
                <div
                  key={idx}
                  onClick={() => handleInspectFileDiff(file.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: activeDiffFile === file.path ? 'var(--sidebar-active-bg)' : 'var(--bg-tertiary)',
                    border: activeDiffFile === file.path ? `1px solid var(--sidebar-active-border)` : '1px solid var(--border-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <FileCode size={14} color="var(--accent-secondary)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.path}
                    </span>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{file.status}</span>
                </div>
              ))
            )}
          </div>

          {/* Diff Viewer Panel */}
          {activeDiffFile && (
            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', maxHeight: '250px', overflow: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{activeDiffFile}</span>
                <button onClick={() => setActiveDiffFile(null)} className="btn-secondary" style={{ padding: '2px 4px' }}>
                  <X size={12} />
                </button>
              </div>
              {loadingDiff ? (
                <div style={{ color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Loading file diff...</div>
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
  );
};
