import React from 'react';
import { LanguageStat } from '../types';

interface Props {
  languages?: LanguageStat[];
}

export const LanguageBar: React.FC<Props> = ({ languages }) => {
  if (!languages || languages.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {/* Single Range-based Progress Bar */}
      <div style={{
        display: 'flex',
        height: '8px',
        width: '100%',
        borderRadius: '9999px',
        overflow: 'hidden',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-color)',
      }}>
        {languages.map((lang, idx) => (
          <div
            key={idx}
            style={{
              width: `${lang.percentage}%`,
              backgroundColor: lang.color || 'var(--accent-primary)',
              height: '100%',
              transition: 'width 0.3s ease',
            }}
            title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Language Breakdown Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.73rem' }}>
        {languages.map((lang, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: lang.color || 'var(--accent-primary)',
              display: 'inline-block',
            }} />
            <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{lang.name}</span>
            <span style={{ color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
              {lang.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
