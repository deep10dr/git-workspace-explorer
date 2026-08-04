import React, { useMemo, useEffect } from 'react';
import { Branch } from '../types';
import { ReactFlow, Background, Controls, Node, Edge, Position, MarkerType, useNodesState, useEdgesState } from '@xyflow/react';
import { GitBranch, Globe, Check } from 'lucide-react';
import '@xyflow/react/dist/style.css';

interface Props {
  branches: Branch[];
  repoName: string;
}

export const BranchExplorer: React.FC<Props> = ({ branches, repoName }) => {
  // Draggable React Flow Node State hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const computeNodesAndEdges = () => {
    const nodesList: Node[] = [];
    const edgesList: Edge[] = [];

    // Find master trunk root
    const mainBranch = branches.find((b) => b.name === 'main' || b.name === 'master' || b.name === 'origin/main') || branches[0];

    let localIndex = 0;
    let remoteIndex = 0;

    branches.forEach((branch) => {
      const isMain = branch.name === 'main' || branch.name === 'master' || branch.name === 'origin/main' || branch.name === 'origin/master';
      const isRemote = branch.isRemote;

      let nodeColor = 'var(--accent-amber)';
      let glow = '0 0 8px rgba(251, 191, 36, 0.2)';

      if (branch.isCurrent) {
        nodeColor = 'var(--accent-emerald)';
        glow = '0 0 12px rgba(52, 211, 153, 0.3)';
      } else if (branch.isMerged) {
        nodeColor = 'var(--accent-orange)';
        glow = '0 0 8px rgba(251, 146, 60, 0.2)';
      }

      let x = 50;
      let y = localIndex * 100 + 50;

      if (isMain) {
        x = 240;
        y = 40;
      } else if (isRemote) {
        x = 450;
        y = remoteIndex * 100 + 120;
        remoteIndex++;
      } else {
        localIndex++;
        y = localIndex * 100 + 120;
      }

      nodesList.push({
        id: `branch-${branch.name}`,
        type: 'default',
        draggable: true,
        data: {
          label: (
            <div style={{ textAlign: 'left', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text-heading)' }}>
                <GitBranch size={14} color={nodeColor} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>
                  {branch.name}
                </span>
                {branch.isCurrent && (
                  <span className="badge badge-emerald" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                    <Check size={8} /> Active
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                {branch.lastCommitSha.substring(0, 7)}
              </div>
            </div>
          ),
        },
        position: { x, y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-main)',
          border: `2px solid ${nodeColor}`,
          borderRadius: 'var(--radius-md)',
          width: 195,
          boxShadow: glow,
        },
      });

      if (!isMain) {
        if (isRemote) {
          const baseName = branch.name.replace('origin/', '').replace('remotes/', '');
          const localMatch = branches.find((b) => b.name === baseName && !b.isRemote);
          if (localMatch) {
            edgesList.push({
              id: `edge-${localMatch.name}->${branch.name}`,
              source: `branch-${localMatch.name}`,
              target: `branch-${branch.name}`,
              style: { stroke: '#a855f7', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
            });
          } else if (mainBranch) {
            edgesList.push({
              id: `edge-main->${branch.name}`,
              source: `branch-${mainBranch.name}`,
              target: `branch-${branch.name}`,
              style: { stroke: 'rgba(100,116,139,0.4)', strokeWidth: 1.5 },
              markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(100,116,139,0.4)' },
            });
          }
        } else {
          if (mainBranch && mainBranch.name !== branch.name) {
            edgesList.push({
              id: `edge-${mainBranch.name}->${branch.name}`,
              source: `branch-${mainBranch.name}`,
              target: `branch-${branch.name}`,
              style: { stroke: '#6366f1', strokeWidth: 2 },
              animated: branch.isCurrent,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
            });
          }
        }
      }

      if (branch.upstream && branches.some((b) => b.name === branch.upstream)) {
        edgesList.push({
          id: `upstream-${branch.name}->${branch.upstream}`,
          source: `branch-${branch.name}`,
          target: `branch-${branch.upstream}`,
          style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '4' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
        });
      }
    });

    return { nodes: nodesList, edges: edgesList };
  };

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = computeNodesAndEdges();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [branches]);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '75vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-heading)' }}>Branch Graph</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Repository: {repoName}</span>
        </div>

        {/* Color Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }} /> Active
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-orange)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)' }} /> Merged
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }} /> Unmerged
          </span>
        </div>
      </div>

      {/* React Flow Board */}
      <div style={{ flex: 1, position: 'relative', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
  );
};
