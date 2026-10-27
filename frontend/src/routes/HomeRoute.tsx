import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { getDashboardSummary, getCases } from '../lib/api';
import { useRegion } from '../context/RegionContext';
import { useRole } from '../context/RoleContext';
import { Skeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { ExecutiveKpiStrip } from '../components/dashboard/ExecutiveKpiStrip';
import { PipelineFunnelChart } from '../components/dashboard/PipelineFunnelChart';
import { RegulatoryClockBar } from '../components/dashboard/RegulatoryClockBar';
import { NeedsAttentionQueue } from '../components/dashboard/NeedsAttentionQueue';
import { InstitutionDashboardCard } from '../components/dashboard/InstitutionDashboardCard';
import { ExpertVisitsCard } from '../components/dashboard/ExpertVisitsCard';
import type { DashboardSummary, CaseSummary } from '../types/domain';

export function HomeRoute() {
  const { selectedRegion } = useRegion();
  const { role, permissions } = useRole();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      getDashboardSummary(selectedRegion),
      getCases('ALL', selectedRegion),
    ])
      .then(([summaryData, caseData]) => {
        setSummary(summaryData);
        setCases(caseData);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Unable to retrieve dashboard metrics.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedRegion]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 4px',
              letterSpacing: '-0.01em',
            }}
          >
            Approval Coordination Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Viewing as <strong>{permissions.roleDisplayName}</strong> · Academic Year 2026-27 ·{' '}
            {selectedRegion === 'ALL' ? 'All Regional Jurisdictions' : `Region ${selectedRegion}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDashboardData}
            leftIcon={<RefreshCw size={13} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/cases')}
            rightIcon={<ArrowRight size={13} />}
          >
            Explore Cases Directory
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          style={{
            padding: 14,
            background: 'var(--status-bad-tint)',
            color: 'var(--status-bad-text)',
            border: '1px solid var(--status-bad-border)',
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <strong>Error loading dashboard:</strong> {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <Skeleton height={14} width="60%" />
                <div style={{ height: 8 }} />
                <Skeleton height={28} width="40%" />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            <Skeleton height={260} />
            <Skeleton height={260} />
          </div>
          <Skeleton height={320} />
        </div>
      )}

      {/* Loaded Dashboard Content */}
      {!loading && summary && (
        <>
          {/* Role Variant 1: Institution Admin View */}
          {role === 'INSTITUTION_ADMIN' && (
            <InstitutionDashboardCard primaryCase={cases[0] || null} />
          )}

          {/* Role Variant 2: EVC Expert View */}
          {role === 'EVC_EXPERT' && (
            <ExpertVisitsCard
              evcCases={cases.filter(
                c => c.status === 'EVC_PENDING' || c.status === 'EVC_SCHEDULED' || c.status === 'EVC_COMPLETED'
              )}
            />
          )}

          {/* Executive KPI Strip (Shown for Officers and as summary for Institution) */}
          {role !== 'EVC_EXPERT' && (
            <ExecutiveKpiStrip summary={summary} role={role} />
          )}

          {/* Role Variant 3: Regional Officer Escalations Top Priority */}
          {role === 'REGIONAL_OFFICER' && (
            <NeedsAttentionQueue cases={cases} role={role} />
          )}

          {/* Two-Panel Row: Pipeline Funnel + Regulatory Clock Health */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: 16,
              alignItems: 'stretch',
            }}
          >
            <PipelineFunnelChart summary={summary} />
            <RegulatoryClockBar summary={summary} />
          </div>

          {/* Scrutiny Officer and Standard Role Priority Queue */}
          {role !== 'REGIONAL_OFFICER' && role !== 'INSTITUTION_ADMIN' && (
            <NeedsAttentionQueue cases={cases} role={role} />
          )}
        </>
      )}
    </div>
  );
}
