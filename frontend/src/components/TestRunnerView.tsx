import React, { useState } from 'react';
import { VerifyResult } from '../types';
import { verifyCommit } from '../services/api';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FlaskConical
} from 'lucide-react';

interface Props {
  repoId: string;
  repoName: string;
  headSha?: string;
}

export const TestRunnerView: React.FC<Props> = ({ repoId, repoName, headSha }) => {
  const [verifying, setVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState<number>(0);
  const [verifyResults, setVerifyResults] = useState<VerifyResult[] | null>(null);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  const handleRunSuite = async () => {
    setVerifying(true);
    setVerifyResults(null);
    setExpandedCheck(null);
    setVerifyProgress(15);

    const interval = setInterval(() => {
      setVerifyProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 450);

    try {
      const data = await verifyCommit(repoId, headSha || 'HEAD');
      clearInterval(interval);
      setVerifyProgress(100);
      setVerifyResults(data);
      const firstFailed = data.find((r) => r.status === 'failure');
      if (firstFailed) {
        setExpandedCheck(firstFailed.name);
      }
    } catch (err) {
      clearInterval(interval);
      console.error('Test verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'var(--accent-glow)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <FlaskConical size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Testing & Verification Suite: {repoName}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
              Run automated linters (go vet, tsc), unit test suites, and build compilation checks on working tree state.
            </span>
          </div>
        </div>

        <button
          onClick={handleRunSuite}
          disabled={verifying}
          className="btn-primary"
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
        >
          <Play size={16} />
          {verifying ? 'Running Suite...' : 'Run Full Test Suite'}
        </button>
      </div>

      {/* Progress Bar Section */}
      {(verifying || verifyResults) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>
              {verifying ? '⚡ Execution in Progress...' : verifyResults?.some(r => r.status === 'failure') ? '❌ Verification Failed (Errors Found)' : '✅ All Verification Suites Passed'}
            </span>
            <span style={{ fontWeight: 700, color: verifyResults?.some(r => r.status === 'failure') ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {verifyProgress}%
            </span>
          </div>
          
          <div style={{
            height: '10px',
            width: '100%',
            background: 'var(--bg-input)',
            borderRadius: '9999px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              width: `${verifyProgress}%`,
              height: '100%',
              background: verifying
                ? 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
                : verifyResults?.some(r => r.status === 'failure')
                  ? 'var(--accent-rose)'
                  : 'var(--accent-emerald)',
              transition: 'width 0.3s ease, background 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* Formatted Error Banner */}
      {verifyResults && verifyResults.some(r => r.status === 'failure') && (
        <div style={{
          background: 'rgba(251, 113, 133, 0.08)',
          border: '1px solid rgba(251, 113, 133, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-rose)', fontWeight: 700, fontSize: '0.92rem' }}>
            <XCircle size={18} />
            <span>Verification Error Diagnostics</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0 }}>
            Automated checks detected compilation, linting, or test errors. Inspect detailed execution logs below for line numbers and exact tracebacks.
          </p>
        </div>
      )}

      {/* Verification Results List */}
      {verifyResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {verifyResults.map((res, idx) => {
            const isExpanded = expandedCheck === res.name;
            const isFailed = res.status === 'failure';

            return (
              <div
                key={idx}
                style={{
                  background: isFailed ? 'rgba(251, 113, 133, 0.04)' : 'var(--bg-secondary)',
                  border: isFailed ? '1px solid rgba(251, 113, 133, 0.25)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {res.status === 'success' ? (
                      <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
                    ) : res.status === 'failure' ? (
                      <XCircle size={18} style={{ color: 'var(--accent-rose)' }} />
                    ) : (
                      <AlertTriangle size={18} style={{ color: 'var(--accent-amber)' }} />
                    )}
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                      {res.name}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedCheck(isExpanded ? null : res.name)}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    {isExpanded ? 'Hide Logs' : 'View Logs'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', paddingLeft: '28px' }}>
                  {res.message}
                </div>

                {isExpanded && (
                  <div style={{
                    marginTop: '8px',
                    background: '#050505',
                    border: isFailed ? '1px solid rgba(251, 113, 133, 0.35)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    maxHeight: '260px',
                    overflow: 'auto',
                  }}>
                    {(res.output || 'No execution log output recorded.').split('\n').map((line, lIdx) => {
                      const isErr = line.includes('error') || line.includes('FAIL') || line.includes('exit status') || line.includes('fatal');
                      return (
                        <div
                          key={lIdx}
                          style={{
                            color: isErr ? '#fb7185' : '#a3e635',
                            fontWeight: isErr ? 700 : 400,
                            background: isErr ? 'rgba(251, 113, 133, 0.14)' : 'transparent',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                          }}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!verifyResults && !verifying && (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-subtle)',
          fontSize: '0.85rem',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-color)',
        }}>
          Click <strong>"Run Full Test Suite"</strong> above to trigger Go linters, TypeScript typechecks, and unit test execution.
        </div>
      )}
    </div>
  );
};
