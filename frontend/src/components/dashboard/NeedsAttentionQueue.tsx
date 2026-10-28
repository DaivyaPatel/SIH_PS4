import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import type { CaseSummary, Role } from '../../types/domain';
import { StatusChip } from '../common/StatusChip';
import { DeadlineChip } from '../common/DeadlineChip';
import { ReadinessRing } from '../common/ReadinessRing';
import { Button } from '../common/Button';

interface NeedsAttentionQueueProps {
  cases: CaseSummary[];
  role: Role;
}

export function NeedsAttentionQueue({ cases, role }: NeedsAttentionQueueProps) {
  const navigate = useNavigate();

  // Sort cases by urgency:
  // 1. Overdue first
  // 2. Approaching deadline second
  // 3. Lowest remaining hours
  // 4. Lowest readiness score
  const urgentCases = [...cases]
    .sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if ((a.remainingHours ?? 999) !== (b.remainingHours ?? 999)) {
        return (a.remainingHours ?? 999) - (b.remainingHours ?? 999);
      }
      return a.readinessScore - b.readinessScore;
    })
    .slice(0, 8);

  // Dynamic Title & Context by Role
  const title =
    role === 'REGIONAL_OFFICER'
      ? 'Statutory Escalations & Priority Queue'
      : role === 'SCRUTINY_OFFICER'
      ? 'My Verification & Deficiency Queue'
      : 'Cases Requiring Immediate Regulatory Attention';

  const subtitle =
    role === 'REGIONAL_OFFICER'
      ? 'Applications approaching breach or exceeding statutory review limits requiring officer intervention'
      : role === 'SCRUTINY_OFFICER'
      ? 'Applications assigned for scrutiny document checks or deficiency resolution'
      : 'Top priority applications sorted by impending deadline and compliance deficit';

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '20px 22px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {role === 'REGIONAL_OFFICER' ? (
              <ShieldAlert size={18} style={{ color: 'var(--status-bad-text)' }} />
            ) : (
              <AlertTriangle size={18} style={{ color: 'var(--status-warn-text)' }} />
            )}
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </h3>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          rightIcon={<ArrowRight size={13} />}
          onClick={() => navigate('/cases')}
        >
          View All Active Cases
        </Button>
      </div>

      {/* Cases List */}
      {urgentCases.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
          No urgent cases currently requiring statutory intervention.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {urgentCases.map(c => {
            let actionLabel = 'Review';
            if (c.status === 'UNDER_SCRUTINY') actionLabel = 'Scrutinize';
            else if (c.status === 'DEFICIENCY_FLAGGED') actionLabel = 'Cure Task';
            else if (c.status === 'EVC_PENDING') actionLabel = 'Schedule EVC';
            else if (c.isOverdue) actionLabel = 'Extend / Intervene';

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                style={{
                  background: c.isOverdue ? 'var(--status-bad-tint)' : 'var(--bg-subtle)',
                  border: `1px solid ${c.isOverdue ? 'var(--status-bad-border)' : 'var(--border)'}`,
                  borderLeft: c.isOverdue ? '3px solid var(--status-bad-solid)' : '3px solid transparent',
                  borderRadius: 8,
                  padding: '11px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = c.isOverdue ? 'var(--status-bad-border)' : 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Left: App Number & Institution */}
                <div style={{ minWidth: 200, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 12,
                        color: 'var(--accent)',
                      }}
                    >
                      {c.applicationNumber}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'var(--bg-surface)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {c.region}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginTop: 3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.institutionName}
                  </div>
                </div>

                {/* Center: Stage Chip & Readiness */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <StatusChip status={c.status} size="sm" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 80 }}>
                    <ReadinessRing score={c.readinessScore} size="sm" showLabel={false} />
                    <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {c.readinessScore}%
                    </span>
                  </div>
                </div>

                {/* Right: Deadline & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <DeadlineChip
                    isOverdue={c.isOverdue}
                    remainingHours={c.remainingHours}
                    remainingBusinessDays={c.remainingBusinessDays}
                    deadlineStatus={c.deadlineStatus}
                    deadlineAtIst={c.deadlineAtIst}
                    size="sm"
                  />

                  <Button
                    size="sm"
                    variant={c.isOverdue ? 'destructive' : 'primary'}
                    rightIcon={<ArrowRight size={12} />}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigate(`/cases/${c.id}`);
                    }}
                  >
                    {actionLabel}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
