import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getDashboardSummary } from '../lib/api';
import { useRegion } from '../context/RegionContext';
import { useRole } from '../context/RoleContext';
import { Skeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import type { DashboardSummary } from '../types/domain';

export function HomeRoute() {
  const { selectedRegion } = useRegion();
  const { permissions } = useRole();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDashboardSummary(selectedRegion)
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Unable to load dashboard metrics.');
        setLoading(false);
      });
  }, [selectedRegion]);

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Approval Coordination Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Viewing as <strong>{permissions.roleDisplayName}</strong> · Academic Year 2026-27 ·{' '}
            {selectedRegion === 'ALL' ? 'All Regional Jurisdictions' : `Region ${selectedRegion}`}
          </p>
        </div>

        <Button variant="primary" onClick={() => navigate('/cases')} rightIcon={<ArrowRight size={14} />}>
          View Active Cases
        </Button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <Skeleton height={14} width="60%" />
              <div style={{ height: 8 }} />
              <Skeleton height={28} width="40%" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          role="alert"
          style={{
            padding: 16,
            background: 'var(--status-bad-tint)',
            color: 'var(--status-bad-text)',
            border: '1px solid var(--status-bad-border)',
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <strong>Error loading metrics:</strong> {error}
        </div>
      )}

      {/* Summary Cards */}
      {!loading && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top KPI Cards Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            <div
              onClick={() => navigate('/cases')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '16px 20px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Colleges</div>
              <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                {summary.kpiCards.totalColleges}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Across monitored jurisdictions</div>
            </div>

            <div
              onClick={() => navigate('/cases?status=UNDER_SCRUTINY')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '16px 20px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Scrutiny</div>
              <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>
                {summary.kpiCards.pendingScrutiny}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Awaiting document verification</div>
            </div>

            <div
              onClick={() => navigate('/deficiencies')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '16px 20px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Open Deficiencies</div>
              <div
                className="tabular-nums"
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: summary.kpiCards.openDeficiencies > 0 ? 'var(--status-bad-text)' : 'var(--status-ok-text)',
                  marginTop: 4,
                }}
              >
                {summary.kpiCards.openDeficiencies}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Active institutional cure tasks</div>
            </div>

            <div
              onClick={() => navigate('/visits')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '16px 20px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Scheduled EVC Visits</div>
              <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 700, color: 'var(--status-ok-text)', marginTop: 4 }}>
                {summary.kpiCards.scheduledInspections}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Committees locked via CP-SAT</div>
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Phase 0 Shell Initialized
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                  All 12 backend services are live and connected. Switch roles or regions in the header to explore contextual behaviors.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => navigate('/cases')}>
                Inspect Cases
              </Button>
              <Button variant="secondary" onClick={() => navigate('/visits')}>
                EVC Scheduling
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
