import React, { useState } from 'react';
import { Folder, RefreshCw, CheckCircle2, Sliders, ShieldCheck, Terminal } from 'lucide-react';

interface SettingsViewProps {
  workspacePath: string;
  onUpdatePath: (newPath: string) => Promise<void>;
  isScanning: boolean;
  totalRepos: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  workspacePath,
  onUpdatePath,
  isScanning,
  totalRepos,
}) => {
  const [inputPath, setInputPath] = useState(workspacePath);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdatePath(inputPath);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sliders size={24} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>Workspace Settings</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', marginTop: '6px', margin: 0 }}>
          Manage your local repository directory path, scanning options, and backend engine status.
        </p>
      </div>

      {/* Section 1: Workspace Path Configuration */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={18} style={{ color: 'var(--accent-primary)' }} />
            Local Workspace Directory Path
          </label>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', margin: 0 }}>
            Specify the folder on your filesystem where your Git repositories are stored. The explorer will automatically discover all `.git` projects inside.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            <input
              type="text"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="/Users/yourname/Projects"
              style={{
                flex: 1,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: 'var(--text-heading)',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-mono)',
              }}
            />

            <button
              type="submit"
              disabled={isScanning}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.88rem' }}
            >
              <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
              {isScanning ? 'Scanning...' : 'Save & Rescan'}
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div style={{
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: 'var(--accent-emerald)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={18} />
            <span>Workspace path saved! Scanned {totalRepos} repositories.</span>
          </div>
        )}
      </form>

      {/* Section 2: Presets */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Quick Directory Presets</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {['/Users/deepak/Projects', '~/Projects', '~/Developer', '~/Code'].map((preset) => (
            <button
              key={preset}
              type="button"
              className="btn-secondary"
              onClick={() => setInputPath(preset)}
              style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', padding: '8px 14px' }}
            >
              <Terminal size={14} /> {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Engine Specifications Table */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Engine & Scanner Status</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px 0', color: 'var(--text-subtle)', width: '220px' }}>Active Directory Path</td>
              <td style={{ padding: '12px 0', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{workspacePath}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px 0', color: 'var(--text-subtle)' }}>Discovered Repositories</td>
              <td style={{ padding: '12px 0', color: 'var(--text-heading)', fontWeight: 700 }}>{totalRepos} Repositories</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px 0', color: 'var(--text-subtle)' }}>Go Engine Status</td>
              <td style={{ padding: '12px 0', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> Online & Listening (Port 8080)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
