import { useNavigate } from 'react-router-dom';
import type { DashboardSummary } from '../../types/domain';

interface PipelineFunnelChartProps {
  summary: DashboardSummary;
}

interface FunnelStage {
  key: string;
  label: string;
  count: number;
  color: string;
  filterParam: string;
}

export function PipelineFunnelChart({ summary }: PipelineFunnelChartProps) {
  const navigate = useNavigate();
  const dist = summary.statusDistribution || {};

  // Aggregate status distribution map into 5 standard statutory pipeline stages
  const intakeCount = (dist['DRAFT'] || 0) + (dist['SUBMITTED'] || 0);
  const scrutinyCount = dist['UNDER_SCRUTINY'] || 0;
  const deficiencyCount = (dist['DEFICIENCY_FLAGGED'] || 0) + (dist['DEFICIENCY_RESUBMITTED'] || 0);
  const evcCount = (dist['EVC_PENDING'] || 0) + (dist['EVC_SCHEDULED'] || 0) + (dist['EVC_COMPLETED'] || 0);
  const decisionCount = (dist['APPROVED'] || 0) + (dist['REJECTED'] || 0);

  const total = intakeCount + scrutinyCount + deficiencyCount + evcCount + decisionCount || 1;

  const stages: FunnelStage[] = [
    {
      key: 'intake',
      label: 'Stage 1: Intake & Registration',
      count: intakeCount,
      color: 'var(--text-secondary)',
      filterParam: 'SUBMITTED',
    },
    {
      key: 'scrutiny',
      label: 'Stage 2: Scrutiny Committee',
      count: scrutinyCount,
      color: 'var(--accent)',
      filterParam: 'UNDER_SCRUTINY',
    },
    {
      key: 'deficiency',
      label: 'Stage 3: Institutional Deficiency Cure',
      count: deficiencyCount,
      color: 'var(--status-warn)',
      filterParam: 'DEFICIENCY_FLAGGED',
    },
    {
      key: 'evc',
      label: 'Stage 4: Expert Visit Committee (EVC)',
      count: evcCount,
      color: 'var(--status-info)',
      filterParam: 'EVC_PENDING',
    },
    {
      key: 'decision',
      label: 'Stage 5: Final Decision (Approved / Rejected)',
      count: decisionCount,
      color: 'var(--status-ok)',
      filterParam: 'APPROVED',
    },
  ];

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '18px 20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        flex: 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Pipeline Stage Funnel
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
            Distribution of applications across statutory stages
          </p>
        </div>
        <span
          className="tabular-nums"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'var(--bg-subtle)',
            padding: '2px 8px',
            borderRadius: 4,
          }}
        >
          {total} Active Cases
        </span>
      </div>

      {/* Funnel Horizontal Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        {stages.map(stg => {
          const percent = Math.round((stg.count / total) * 100);

          return (
            <div
              key={stg.key}
              onClick={() => navigate(`/cases?status=${stg.filterParam}`)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '4px 6px',
                borderRadius: 6,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stg.label}</span>
                <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  <strong>{stg.count}</strong> ({percent}%)
                </span>
              </div>

              {/* Progress track */}
              <div
                style={{
                  height: 10,
                  background: 'var(--bg-subtle)',
                  borderRadius: 5,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(percent, stg.count > 0 ? 3 : 0)}%`,
                    background: stg.color,
                    borderRadius: 5,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
