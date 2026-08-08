import React from 'react';
import { WorkspaceOverview } from '../types';
import { 
  Folder, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight, 
  Archive 
} from 'lucide-react';

interface Props {
  overview: WorkspaceOverview;
}

export const WorkspaceStats: React.FC<Props> = ({ overview }) => {
  const cards = [
    {
      title: 'Repositories',
      value: overview.totalRepositories,
      subtitle: `${overview.cleanRepositories} clean · ${overview.dirtyRepositories} modified`,
      icon: Folder,
      color: 'var(--accent-primary)',
      bg: 'var(--accent-glow)',
    },
    {
      title: 'Repository Health',
      value: `${overview.totalRepositories - overview.warningIssues}/${overview.totalRepositories}`,
      subtitle: overview.warningIssues > 0 ? `${overview.warningIssues} project(s) need attention` : 'All projects healthy',
      icon: overview.warningIssues > 0 ? AlertTriangle : ShieldCheck,
      color: overview.warningIssues > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
      bg: overview.warningIssues > 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(74, 222, 128, 0.1)',
    },
    {
      title: 'Unpushed Commits',
      value: overview.unpushedCommits,
      subtitle: 'Commits ahead of remote branches',
      icon: ArrowUpRight,
      color: 'var(--accent-blue)',
      bg: 'rgba(96, 165, 250, 0.1)',
    },
    {
      title: 'Active Stashes',
      value: overview.totalStashes,
      subtitle: 'Total stashed changes across workspace',
      icon: Archive,
      color: 'var(--accent-secondary)',
      bg: 'rgba(45, 212, 191, 0.1)',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="glass-panel animate-fade-in" style={{
            padding: '16px 18px',
            display: 'flex', flexDirection: 'column', gap: '10px',
            animationDelay: `${idx * 60}ms`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.title}</span>
              <div style={{ background: card.bg, padding: '6px', borderRadius: 'var(--radius-md)' }}>
                <Icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
};
