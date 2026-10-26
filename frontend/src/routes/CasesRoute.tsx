import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getCases } from '../lib/api';
import { useRegion } from '../context/RegionContext';
import { StatusChip } from '../components/common/StatusChip';
import { DeadlineChip } from '../components/common/DeadlineChip';
import { ReadinessRing } from '../components/common/ReadinessRing';
import { SkeletonTable } from '../components/common/Skeleton';
import type { CaseSummary } from '../types/domain';

export function CasesRoute() {
  const { selectedRegion } = useRegion();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCases('ALL', selectedRegion)
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Unable to load cases.');
        setLoading(false);
      });
  }, [selectedRegion]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Applications & Cases
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Tracking {cases.length} college cases under active statutory review
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <SkeletonTable rows={5} columns={6} />
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            padding: 16,
            background: 'var(--status-bad-tint)',
            color: 'var(--status-bad-text)',
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Application No.</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Institution</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Region</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Readiness</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Statutory Deadline</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(c => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace' }}>
                    {c.applicationNumber}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.institutionName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.institutionCode}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 6px',
                        background: 'var(--bg-subtle)',
                        borderRadius: 4,
                      }}
                    >
                      {c.region}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusChip status={c.status} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <ReadinessRing score={c.readinessScore} size="sm" />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <DeadlineChip
                      isOverdue={c.isOverdue}
                      remainingHours={c.remainingHours}
                      remainingBusinessDays={c.remainingBusinessDays}
                      deadlineStatus={c.deadlineStatus}
                      deadlineAtIst={c.deadlineAtIst}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Open <ArrowRight size={14} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
