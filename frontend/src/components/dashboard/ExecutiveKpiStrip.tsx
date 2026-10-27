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

  const cards = [
    {
      id: 'totalColleges',
      label: 'Total Colleges',
      value: kpis.totalColleges,
      context: 'Registered institutions',
      icon: Building2,
      color: 'var(--text-primary)',
      bg: 'var(--bg-surface)',
      border: 'var(--border)',
      onClick: () => navigate('/cases'),
    },
    {
      id: 'pendingScrutiny',
      label: 'Pending Scrutiny',
      value: kpis.pendingScrutiny,
      context: 'Awaiting doc verification',
      icon: FileSearch,
      color: 'var(--accent)',
      bg: 'var(--bg-surface)',
      border: role === 'SCRUTINY_OFFICER' ? 'var(--accent)' : 'var(--border)',
      onClick: () => navigate('/cases?status=UNDER_SCRUTINY'),
    },
    {
      id: 'openDeficiencies',
      label: 'Open Deficiencies',
      value: kpis.openDeficiencies,
      context: 'Active institutional cures',
      icon: AlertTriangle,
      color: kpis.openDeficiencies > 0 ? 'var(--status-warn-text)' : 'var(--status-ok-text)',
      bg: kpis.openDeficiencies > 0 ? 'var(--status-warn-tint)' : 'var(--bg-surface)',
      border: kpis.openDeficiencies > 0 ? 'var(--status-warn-border)' : 'var(--border)',
      onClick: () => navigate('/cases?status=DEFICIENCY_FLAGGED'),
    },
    {
      id: 'scheduledInspections',
      label: 'Scheduled Visits',
      value: kpis.scheduledInspections,
      context: 'EVC committee locked',
      icon: CalendarCheck2,
      color: 'var(--status-info-text)',
      bg: 'var(--bg-surface)',
      border: 'var(--border)',
      onClick: () => navigate('/cases?status=EVC_SCHEDULED'),
    },
    {
      id: 'approvedCount',
      label: 'Approved',
      value: kpis.approvedCount,
      context: 'AY 2026-27 grants',
      icon: CheckCircle2,
      color: 'var(--status-ok-text)',
      bg: 'var(--bg-surface)',
      border: 'var(--border)',
      onClick: () => navigate('/cases?status=APPROVED'),
    },
    {
      id: 'rejectedCount',
      label: 'Rejected',
      value: kpis.rejectedCount,
      context: 'Statutory non-compliance',
      icon: XCircle,
      color: 'var(--text-secondary)',
      bg: 'var(--bg-surface)',
      border: 'var(--border)',
      onClick: () => navigate('/cases?status=REJECTED'),
    },
    {
      id: 'criticalEscalations',
      label: 'Critical Escalations',
      value: kpis.criticalEscalations,
      context: kpis.criticalEscalations > 0 ? 'Statutory SLA breached' : 'All clocks healthy',
      icon: ShieldAlert,
      color: kpis.criticalEscalations > 0 ? 'var(--status-bad-text)' : 'var(--text-secondary)',
      bg: kpis.criticalEscalations > 0 ? 'var(--status-bad-tint)' : 'var(--bg-surface)',
      border: kpis.criticalEscalations > 0 ? 'var(--status-bad-border)' : 'var(--border)',
      onClick: () => navigate('/cases?deadline=OVERDUE'),
    },
    {
      id: 'averageReadinessScore',
      label: 'Average Readiness',
      value: `${Math.round(kpis.averageReadinessScore)}%`,
      context: 'Composite compliance',
      isRing: true,
      score: Math.round(kpis.averageReadinessScore),
      color: 'var(--text-primary)',
      bg: 'var(--bg-surface)',
      border: 'var(--border)',
      onClick: () => navigate('/cases'),
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}
    >
      {cards.map(card => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            onClick={card.onClick}
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              borderRadius: 8,
              padding: '14px 16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.borderColor = card.border;
            }}
          >
            {/* Top row: Label & Icon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {card.label}
              </span>
              {card.isRing ? (
                <ReadinessRing score={card.score || 0} size="sm" showLabel={false} />
              ) : Icon ? (
                <Icon size={16} style={{ color: card.color, opacity: 0.85 }} />
              ) : null}
            </div>

            {/* Middle: Large Tabular Metric */}
            <div
              className="tabular-nums"
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: card.color,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {card.value}
            </div>

            {/* Bottom context line */}
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                marginTop: 6,
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
  );
}
