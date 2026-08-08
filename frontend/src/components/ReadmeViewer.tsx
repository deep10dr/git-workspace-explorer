import React from 'react';

interface Props {
  content: string;
}

export const ReadmeViewer: React.FC<Props> = ({ content }) => {
  if (!content || !content.trim()) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-subtle)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
        No README.md file content available.
      </div>
    );
  }

  // Parse markdown line by line into structured elements
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${idx}`} style={{
            background: '#0a0a0c',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            margin: '12px 0',
            overflowX: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#a3e635',
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre', fontFamily: 'var(--font-mono)' }}>
              {codeBlockLines.join('\n')}
            </pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', margin: '16px 0 8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', margin: '14px 0 6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} style={{ fontSize: '1.05rem', fontWeight: 650, color: 'var(--accent-primary)', margin: '12px 0 4px' }}>
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={idx} style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', margin: '10px 0 4px' }}>
          {line.replace('#### ', '')}
        </h4>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={idx} style={{
          borderLeft: '3px solid var(--accent-primary)',
          background: 'var(--accent-glow)',
          padding: '8px 14px',
          margin: '8px 0',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          fontSize: '0.85rem',
          color: 'var(--text-main)',
        }}>
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={idx} style={{ margin: '3px 0 3px 20px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          {line.substring(2)}
        </li>
      );
    } else if (line.trim() === '---') {
      elements.push(
        <hr key={idx} style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
      );
    } else if (line.trim() !== '') {
      elements.push(
        <p key={idx} style={{ margin: '6px 0', fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
          {line}
        </p>
      );
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {elements}
    </div>
  );
};
