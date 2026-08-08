import React from 'react';
import { Info, FolderGit2, Command, Terminal, CheckCircle2 } from 'lucide-react';

interface AboutViewProps {
  totalRepos: number;
  workspacePath: string;
}

export const AboutView: React.FC<AboutViewProps> = ({ totalRepos, workspacePath }) => {
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'var(--accent-primary)',
            width: '42px', height: '42px',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FolderGit2 size={24} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>Git Workspace Explorer</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.04em', marginTop: '2px' }}>
              VERSION 1.0.0 · GO + REACT
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Overview</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.65, margin: 0 }}>
          Git Workspace Explorer is a fast desktop workspace scanner for local Git repositories. It scans directory trees in parallel, builds live commit graphs, inspects stashes and branches, and runs code vetting tools (gofmt, golangci-lint, prettier, gitleaks, mypy, pytest) directly on your machine.
        </p>
      </div>

      {/* Engine & System Specs Table */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>System Specifications</h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px 0', color: 'var(--text-subtle)', width: '220px' }}>Backend Engine</td>
              <td style={{ padding: '12px 0', color: 'var(--text-heading)', fontWeight: 600 }}>Go Parallel Engine (`git-workspace-explorer`)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px 0', color: 'var(--text-subtle)' }}>Frontend Interface</td>
              <td style={{ padding: '12px 0', color: 'var(--text-heading)', fontWeight: 600 }}>React + TypeScript + Vite + Lucide Icons</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px 0', color: 'var(--text-subtle)' }}>Graph Visualization</td>
              <td style={{ padding: '12px 0', color: 'var(--text-heading)', fontWeight: 600 }}>@xyflow/react Graph Engine</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px 0', color: 'var(--text-subtle)' }}>Discovered Repositories</td>
              <td style={{ padding: '12px 0', color: 'var(--accent-primary)', fontWeight: 700 }}>{totalRepos} Repositories</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px 0', color: 'var(--text-subtle)' }}>Active Workspace Path</td>
              <td style={{ padding: '12px 0', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{workspacePath}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Keyboard Shortcuts Section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Command size={18} style={{ color: 'var(--accent-primary)' }} /> Keyboard Shortcuts
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Open Global Search Modal</span>
            <kbd style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>⌘K / Ctrl+K</kbd>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Toggle Sidebar Collapse</span>
            <kbd style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>Top Arrow Button</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
