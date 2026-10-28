import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FileSearch,
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import type { DashboardSummary, Role } from '../../types/domain';
import { ReadinessRing } from '../common/ReadinessRing';

interface ExecutiveKpiStripProps {
  summary: DashboardSummary;
  role: Role;
}

export function ExecutiveKpiStrip({ summary, role }: ExecutiveKpiStripProps) {
  const navigate = useNavigate();
  const kpis = summary.kpiCards;

  const primaryCards = [
    {
      id: 'totalColleges',
      label: 'Total Colleges',
      value: kpis.totalColleges,
      context: 'Registered institutions',
      icon: Building2,
      accentColor: 'var(--accent)',
      badge: 'AY 2026-27',
      badgeBg: 'var(--accent-subtle)',
      badgeText: 'var(--accent)',
      onClick: () => navigate('/cases'),
    },
    {
      id: 'pendingScrutiny',
      label: 'Pending Scrutiny',
      value: kpis.pendingScrutiny,
      context: 'Awaiting doc verification',
      icon: FileSearch,
      accentColor: 'var(--accent)',
      badge: role === 'SCRUTINY_OFFICER' ? 'My Action Queue' : 'In Review',
      badgeBg: 'var(--accent-subtle)',
      badgeText: 'var(--accent)',
      onClick: () => navigate('/cases?status=UNDER_SCRUTINY'),
    },
    {
      id: 'openDeficiencies',
      label: 'Open Deficiencies',
      value: kpis.openDeficiencies,
      context: 'Active institutional cures',
      icon: AlertTriangle,
      accentColor: kpis.openDeficiencies > 0 ? 'var(--status-warn-text)' : 'var(--status-ok-text)',
      badge: kpis.openDeficiencies > 0 ? 'Action Required' : 'Clean',
      badgeBg: kpis.openDeficiencies > 0 ? 'var(--status-warn-tint)' : 'var(--status-ok-tint)',
      badgeText: kpis.openDeficiencies > 0 ? 'var(--status-warn-text)' : 'var(--status-ok-text)',
      onClick: () => navigate('/cases?status=DEFICIENCY_FLAGGED'),
    },
    {
      id: 'criticalEscalations',
      label: 'Critical Escalations',
      value: kpis.criticalEscalations,
      context: kpis.criticalEscalations > 0 ? 'Statutory SLA breached' : 'All clocks healthy',
      icon: ShieldAlert,
      accentColor: kpis.criticalEscalations > 0 ? 'var(--status-bad-text)' : 'var(--status-ok-text)',
      badge: kpis.criticalEscalations > 0 ? 'Priority Breach' : 'Healthy',
      badgeBg: kpis.criticalEscalations > 0 ? 'var(--status-bad-tint)' : 'var(--status-ok-tint)',
      badgeText: kpis.criticalEscalations > 0 ? 'var(--status-bad-text)' : 'var(--status-ok-text)',
      onClick: () => navigate('/cases?deadline=OVERDUE'),
    },
  ];

  const secondaryStats = [
    {
      id: 'approvedCount',
      label: 'Approved',
      value: kpis.approvedCount,
      context: 'AY 2026-27 grants',
      icon: CheckCircle2,
      color: 'var(--status-ok-text)',
      onClick: () => navigate('/cases?status=APPROVED'),
    },
    {
      id: 'scheduledInspections',
      label: 'Scheduled Visits',
      value: kpis.scheduledInspections,
      context: 'EVC committee locked',
      icon: CalendarCheck2,
      color: 'var(--status-info-text)',
      onClick: () => navigate('/cases?status=EVC_SCHEDULED'),
    },
    {
      id: 'rejectedCount',
      label: 'Rejected',
      value: kpis.rejectedCount,
      context: 'Statutory non-compliance',
      icon: XCircle,
      color: 'var(--text-muted)',
      onClick: () => navigate('/cases?status=REJECTED'),
    },
    {
      id: 'averageReadiness',
      label: 'Average Readiness',
      value: `${Math.round(kpis.averageReadinessScore)}%`,
      context: 'Composite compliance',
      score: kpis.averageReadinessScore,
      isRing: true,
      onClick: () => navigate('/cases'),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Primary KPI Grid: 4 Clean Elevated Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 14,
        }}
      >
        {primaryCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.onClick}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '16px 18px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-card)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              {/* Top row: Label & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {card.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: card.badgeBg,
                    color: card.badgeText,
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  {card.badge}
                </span>
              </div>

              {/* Middle row: Big Metric Number and Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {card.value}
                </div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.accentColor,
                  }}
                >
                  <Icon size={17} />
                </div>
              </div>

              {/* Bottom context line */}
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {card.context}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Status Strip: 4 Unified Pipeline Metric Items */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '12px 20px',
          boxShadow: 'var(--shadow-card)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          alignItems: 'center',
        }}
      >
        {secondaryStats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 6,
                borderLeft: idx > 0 ? '1px solid var(--border)' : 'none',
                paddingLeft: idx > 0 ? 16 : 6,
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {item.isRing ? (
                <ReadinessRing score={item.score || 0} size="sm" showLabel={false} />
              ) : Icon ? (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} />
                </div>
              ) : null}

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.value}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.context}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
