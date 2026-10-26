import { useEffect, useState } from 'react';
import { getExperts } from '../lib/api';
import { useRegion } from '../context/RegionContext';
import { Skeleton } from '../components/common/Skeleton';
import type { ExpertDetail } from '../types/domain';

export function VisitsRoute() {
  const { selectedRegion } = useRegion();
  const [experts, setExperts] = useState<ExpertDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getExperts('ALL', selectedRegion)
      .then(data => {
        setExperts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedRegion]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Expert Visits & Committee Pool
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Academic experts registered for Expert Visit Committee (EVC) campus inspections
        </p>
      </div>

      {loading ? (
        <Skeleton height={200} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {experts.map(exp => (
            <div
              key={exp.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{exp.name}</div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--bg-subtle)',
                  }}
                >
                  {exp.region}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {exp.designation} · {exp.affiliatedInstitution}
              </div>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>
                Domain: {exp.domain.replace(/_/g, ' ')}
              </div>
              {exp.availableDates.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Next available: {exp.availableDates[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
