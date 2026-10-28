import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import type { CaseDerivedState } from '../../lib/caseLogic';

interface EscalationBannerProps {
  overdueCases: CaseDerivedState[];
}

export function EscalationBanner({ overdueCases }: EscalationBannerProps) {
  const navigate = useNavigate();

  if (overdueCases.length === 0) return null;

  return (
    <div
      role="alert"
      style={{
        padding: '10px 14px',
        background: 'var(--status-bad-tint)',
        border: '1px solid var(--status-bad-border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={16} style={{ color: 'var(--status-bad-solid)' }} />
        <span style={{ color: 'var(--status-bad-text)', fontWeight: 600 }}>
          Statutory Turnaround Breach:
        </span>
        <span style={{ color: 'var(--text-primary)' }}>
          {overdueCases.length} {overdueCases.length === 1 ? 'case is' : 'cases are'} currently overdue:
        </span>
        <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
          {overdueCases.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              style={{
                background: 'none',
                border: 0,
                color: 'var(--status-bad-text)',
                fontWeight: 700,
                fontFamily: 'monospace',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              {c.applicationNumber} ({c.relativeTimeText})
            </button>
          ))}
        </div>
      </div>

      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Intervention required per APH Chapter II norms
      </span>
    </div>
  );
}

