import React, { useState, useEffect } from 'react';
import { Folder, RefreshCw, CheckCircle2, Sliders, ShieldCheck, Terminal, Download, Copy, Check, Wrench } from 'lucide-react';
import { fetchTools, ToolInfo } from '../services/api';

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
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loadingTools, setLoadingTools] = useState<boolean>(true);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const loadToolStatus = async () => {
    setLoadingTools(true);
    try {
      const data = await fetchTools();
      setTools(data);
    } catch (err) {
      console.error('Failed to load tool status:', err);
    } finally {
      setLoadingTools(false);
    }
  };

  useEffect(() => {
    loadToolStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdatePath(inputPath);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
      {/* Fixed Page Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sliders size={24} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>Workspace & Tooling Settings</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', marginTop: '4px', margin: 0 }}>
          Manage your local workspace folder path, backend scanner options, and code verification tool packages.
        </p>
      </div>

      {/* Scrollable Overflow Settings Body */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingRight: '4px' }}>

      {/* Section 1: Workspace Path Configuration */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={18} style={{ color: 'var(--accent-primary)' }} />
            Local Workspace Directory Path
          </label>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', margin: 0 }}>
            Specify the directory on your computer containing Git repositories. The engine scans and indexes all projects inside.
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
            <span>Workspace directory updated and rescanned ({totalRepos} repositories found).</span>
          </div>
        )}
      </form>

      {/* Section 2: Directory Presets */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Directory Presets</h3>
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

      {/* Section 3: Verification Tools & Package Manager Table */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={20} style={{ color: 'var(--accent-primary)' }} /> Testing & Code Verification Tool Packages
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', margin: 0, marginTop: '4px' }}>
              When a commit or file is checked, the app automatically selects testing tools based on file extensions (.go, .py, .ts, .yaml). Below is the status and terminal install command for each package.
            </p>
          </div>
          <button className="btn-secondary" onClick={loadToolStatus} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            <RefreshCw size={14} className={loadingTools ? 'animate-spin' : ''} /> Check Status
          </button>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                <th style={{ padding: '12px 16px' }}>Tool / Package</th>
                <th style={{ padding: '12px 16px' }}>Target Language</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Install Command</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Est. Size</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-heading)' }}>
                    {tool.name}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400, marginTop: '2px' }}>
                      {tool.description}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {tool.language}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {tool.category}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${tool.isInstalled ? 'badge-emerald' : 'badge-amber'}`}>
                      {tool.isInstalled ? 'INSTALLED' : 'MISSING'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{
                        background: 'var(--bg-tertiary)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-heading)',
                        border: '1px solid var(--border-color)',
                      }}>
                        {tool.installCmd}
                      </code>
                      {tool.installCmd.includes(' ') && (
                        <button
                          onClick={() => handleCopyCmd(tool.installCmd)}
                          className="btn-secondary"
                          style={{ padding: '4px', borderRadius: '4px' }}
                          title="Copy install command"
                        >
                          {copiedCmd === tool.installCmd ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {tool.sizeEstimate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Engine Specifications Table */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Engine Status Summary</h3>
        
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
  </div>
);
};
