import React from 'react';
import { Repository } from '../types';
import { Clock, GitCommit, GitBranch, Archive, AlertTriangle, User, ChevronRight } from 'lucide-react';

interface ActivityFeedViewProps {
  repositories: Repository[];
  onSelectRepo: (repo: Repository) => void;
}

interface ActivityEvent {
  id: string;
  type: 'commit' | 'branch' | 'stash' | 'health';
  repoName: string;
  repo: Repository;
  title: string;
  subtitle: string;
  author?: string;
  timestamp: string;
  badgeText: string;
  badgeStyle: 'emerald' | 'amber' | 'indigo' | 'rose';
}

export const ActivityFeedView: React.FC<ActivityFeedViewProps> = ({ repositories, onSelectRepo }) => {
  const events: ActivityEvent[] = [];

  repositories.forEach((repo) => {
    if (repo.lastCommit) {
      events.push({
        id: `commit-${repo.id}`,
        type: 'commit',
        repoName: repo.name,
        repo,
        title: repo.lastCommit.message,
        subtitle: `Commit ${repo.lastCommit.shortSha} on ${repo.currentBranch}`,
        author: repo.lastCommit.author,
        timestamp: repo.lastCommit.timestamp,
        badgeText: 'COMMIT',
        badgeStyle: 'indigo',
      });
    }

    if (!repo.status.isClean) {
      events.push({
        id: `status-${repo.id}`,
        type: 'health',
        repoName: repo.name,
        repo,
        title: `${repo.status.totalChanges} uncommitted changes`,
        subtitle: `${repo.status.modifiedFiles.length} modified, ${repo.status.untrackedFiles.length} untracked files`,
        timestamp: repo.lastActivity,
        badgeText: 'MODIFIED',
        badgeStyle: 'amber',
      });
    }

    if (repo.stashCount > 0) {
      events.push({
        id: `stash-${repo.id}`,
        type: 'stash',
        repoName: repo.name,
        repo,
        title: `${repo.stashCount} active stash(es)`,
        subtitle: `Saved working tree state`,
        timestamp: repo.lastActivity,
        badgeText: 'STASH',
        badgeStyle: 'emerald',
      });
    }
  });

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
      {/* Fixed Page Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={24} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>Activity Feed</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', marginTop: '4px', margin: 0 }}>
            Chronological log of commits, working tree changes, and stashes across all workspace projects.
          </p>
        </div>
        <span className="badge badge-indigo">{events.length} Events</span>
      </div>

      {/* Scrollable Overflow Timeline Stream */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)' }}>
        {events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.88rem' }}>
            No recent activity events recorded.
          </div>
        ) : (
          events.map((event, idx) => {
            const getIcon = () => {
              switch (event.type) {
                case 'commit': return <GitCommit size={16} style={{ color: 'var(--accent-primary)' }} />;
                case 'stash': return <Archive size={16} style={{ color: 'var(--accent-emerald)' }} />;
                case 'health': return <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />;
                default: return <GitBranch size={16} style={{ color: 'var(--accent-secondary)' }} />;
              }
            };

            return (
              <div
                key={event.id}
                onClick={() => onSelectRepo(event.repo)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderBottom: idx === events.length - 1 ? 'none' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                className="table-row-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {getIcon()}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {event.title}
                      </span>
                      <span className={`badge badge-${event.badgeStyle}`}>
                        {event.badgeText}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                        {event.repoName}
                      </span>
                      <span>·</span>
                      <span>{event.subtitle}</span>
                      {event.author && (
                        <>
                          <span>·</span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {event.author}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
