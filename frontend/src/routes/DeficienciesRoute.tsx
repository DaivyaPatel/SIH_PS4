import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getCases } from '../lib/api';
import { useRegion } from '../context/RegionContext';
import { StatusChip } from '../components/common/StatusChip';
import { DeadlineChip } from '../components/common/DeadlineChip';
import { Skeleton } from '../components/common/Skeleton';
import type { CaseSummary } from '../types/domain';

export function DeficienciesRoute() {
  const { selectedRegion } = useRegion();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCases('DEFICIENCY_FLAGGED', selectedRegion)
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedRegion]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Deficiencies Workspace
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Monitor statutory deficiency cure cycles across institutions
        </p>
      </div>

      {loading ? (
        <Skeleton height={200} />
      ) : cases.length === 0 ? (
        <div style={{ padding: 32, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
          <AlertTriangle size={32} color="var(--status-ok-solid)" style={{ marginBottom: 8 }} />
          <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>No Active Deficiencies</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            All cases in the selected region currently have clean compliance standing.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cases.map(c => (
            <div
              key={c.id}
              style={{
                padding: 16,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.applicationNumber}</span>
                  <StatusChip status={c.status} />
                  <span style={{ fontSize: 11, background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>
                    Region: {c.region}
                  </span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.institutionName}</div>
              </div>
              <DeadlineChip
                isOverdue={c.isOverdue}
                remainingHours={c.remainingHours}
                remainingBusinessDays={c.remainingBusinessDays}
                deadlineStatus={c.deadlineStatus}
                deadlineAtIst={c.deadlineAtIst}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
