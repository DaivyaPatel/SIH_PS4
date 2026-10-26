import { useNavigate } from 'react-router-dom';
import type { CaseSummary, CaseStatus } from '../../types/domain';
import { StatusChip } from '../common/StatusChip';
import { DeadlineChip } from '../common/DeadlineChip';
import { ReadinessRing } from '../common/ReadinessRing';

interface CaseBoardViewProps {
  cases: CaseSummary[];
}

interface ColumnConfig {
  key: string;
  label: string;
  color: string;
  statuses: CaseStatus[];
}

export function CaseBoardView({ cases }: CaseBoardViewProps) {
  const navigate = useNavigate();

  const columns: ColumnConfig[] = [
    {
      key: 'intake',
      label: 'Intake',
      color: 'var(--text-secondary)',
      statuses: ['DRAFT', 'SUBMITTED'],
    },
    {
      key: 'scrutiny',
      label: 'Under Scrutiny',
      color: 'var(--accent)',
      statuses: ['UNDER_SCRUTINY'],
    },
    {
      key: 'deficiency',
      label: 'Deficiency Flagged',
      color: 'var(--status-warn)',
      statuses: ['DEFICIENCY_FLAGGED'],
    },
    {
      key: 'evc',
      label: 'EVC Pending',
      color: 'var(--status-info)',
      statuses: ['EVC_PENDING'],
    },
    {
      key: 'approved',
      label: 'Approved',
      color: 'var(--status-ok)',
      statuses: ['APPROVED'],
    },
    {
      key: 'rejected',
      label: 'Rejected',
      color: 'var(--status-bad)',
      statuses: ['REJECTED'],
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        alignItems: 'start',
      }}
    >
      {columns.map(col => {
        const colCases = cases.filter(c => col.statuses.includes(c.status));

        return (
          <div
            key={col.key}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 230px)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
                borderTop: `3px solid ${col.color}`,
                borderTopLeftRadius: 7,
                borderTopRightRadius: 7,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-subtle)',
                position: 'sticky',
                top: 0,
                zIndex: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {col.label}
                </span>
              </div>
              <span
                className="tabular-nums"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: 12,
                }}
              >
                {colCases.length}
              </span>
            </div>

            {/* Cards List */}
            <div
              style={{
                padding: 12,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {colCases.length === 0 ? (
                <div
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  No cases in this stage
                </div>
              ) : (
                colCases.map(c => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    style={{
                      background: 'var(--bg-page)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Top Row: App Number & Region */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--accent)',
                        }}
                      >
                        {c.applicationNumber}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'var(--bg-subtle)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {c.region}
                      </span>
                    </div>

                    {/* College Name & Type */}
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          lineHeight: 1.35,
                          marginBottom: 2,
                        }}
                      >
                        {c.institutionName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {c.institutionType.replace(/_/g, ' ')}
                      </div>
                    </div>

                    {/* Stage Chip */}
                    <div>
                      <StatusChip status={c.status} size="sm" />
                    </div>

                    {/* Bottom Row: Deadline & Readiness Ring */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 8,
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <DeadlineChip
                        isOverdue={c.isOverdue}
                        remainingHours={c.remainingHours}
                        remainingBusinessDays={c.remainingBusinessDays}
                        deadlineStatus={c.deadlineStatus}
                        deadlineAtIst={c.deadlineAtIst}
                        size="sm"
                      />

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ReadinessRing score={c.readinessScore} size="sm" showLabel={false} />
                        <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 700 }}>
                          {c.readinessScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
