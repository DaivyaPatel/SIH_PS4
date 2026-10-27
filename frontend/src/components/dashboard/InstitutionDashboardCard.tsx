import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { CaseSummary, CaseStatus } from '../../types/domain';
import { StatusChip } from '../common/StatusChip';
import { DeadlineChip } from '../common/DeadlineChip';
import { ReadinessRing } from '../common/ReadinessRing';
import { Button } from '../common/Button';

interface InstitutionDashboardCardProps {
  primaryCase: CaseSummary | null;
}

export function InstitutionDashboardCard({ primaryCase }: InstitutionDashboardCardProps) {
  const navigate = useNavigate();

  if (!primaryCase) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <Building2 size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
        <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>No Active Institutional Application</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
          Register a new institution or check existing submissions in the cases directory.
        </p>
        <Button variant="primary" onClick={() => navigate('/cases')}>
          Browse Applications
        </Button>
      </div>
    );
  }

  const steps: Array<{ key: CaseStatus; label: string }> = [
    { key: 'SUBMITTED', label: '1. Intake' },
    { key: 'UNDER_SCRUTINY', label: '2. Scrutiny' },
    { key: 'DEFICIENCY_FLAGGED', label: '3. Deficiency' },
    { key: 'EVC_PENDING', label: '4. Expert Visit' },
    { key: 'APPROVED', label: '5. Decision' },
  ];

  const statusOrder: Record<CaseStatus, number> = {
    DRAFT: 1,
    SUBMITTED: 1,
    UNDER_SCRUTINY: 2,
    DEFICIENCY_FLAGGED: 3,
    DEFICIENCY_RESUBMITTED: 3,
    EVC_PENDING: 4,
    EVC_SCHEDULED: 4,
    EVC_COMPLETED: 4,
    APPROVED: 5,
    REJECTED: 5,
  };

  const currentOrder = statusOrder[primaryCase.status] || 1;

  let nextStepText = 'Your application has been received and queued for scrutiny review.';
  let isActionRequired = false;

  if (primaryCase.status === 'UNDER_SCRUTINY') {
    nextStepText = 'The Regional Scrutiny Committee is verifying uploaded certificates and statutory norms.';
  } else if (primaryCase.status === 'DEFICIENCY_FLAGGED') {
    nextStepText = 'Statutory deficiencies have been flagged. Upload compliance proofs before the cure deadline.';
    isActionRequired = true;
  } else if (primaryCase.status === 'EVC_PENDING' || primaryCase.status === 'EVC_SCHEDULED') {
    nextStepText = 'An Expert Visit Committee (EVC) has been formulated for physical campus verification.';
  } else if (primaryCase.status === 'APPROVED') {
    nextStepText = 'Congratulations! Approval for Academic Year 2026-27 has been granted by AICTE Council.';
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '22px 24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--accent)',
            }}
          >
            Institutional Application Portal · Academic Year {primaryCase.academicYear}
          </span>
          <h2 style={{ margin: '4px 0 6px', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            {primaryCase.institutionName}
          </h2>
          <div style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>
              {primaryCase.applicationNumber}
            </span>
            <span>·</span>
            <span>Region {primaryCase.region}</span>
            <span>·</span>
            <span>{primaryCase.applicationType.replace(/_/g, ' ')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusChip status={primaryCase.status} size="md" />
          <DeadlineChip
            isOverdue={primaryCase.isOverdue}
            remainingHours={primaryCase.remainingHours}
            remainingBusinessDays={primaryCase.remainingBusinessDays}
            deadlineStatus={primaryCase.deadlineStatus}
            deadlineAtIst={primaryCase.deadlineAtIst}
            size="md"
          />
        </div>
      </div>

      {/* Progress Stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8,
          padding: '14px 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {steps.map(st => {
          const stepIdx = statusOrder[st.key] || 1;
          const isDone = currentOrder > stepIdx;
          const isActive = currentOrder === stepIdx;

          let color = 'var(--text-muted)';
          let bg = 'var(--bg-subtle)';
          let border = 'var(--border)';
          let Icon = Clock;

          if (isDone) {
            color = 'var(--status-ok-text)';
            bg = 'var(--status-ok-tint)';
            border = 'var(--status-ok)';
            Icon = CheckCircle;
          } else if (isActive) {
            color = 'var(--accent)';
            bg = 'var(--accent-subtle)';
            border = 'var(--accent)';
            Icon = ShieldCheck;
          }

          return (
            <div
              key={st.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 6,
                background: bg,
                border: `1px solid ${border}`,
              }}
            >
              <Icon size={16} style={{ color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color }}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Next Step Banner */}
      <div
        style={{
          background: isActionRequired ? 'var(--status-warn-tint)' : 'var(--bg-subtle)',
          border: `1px solid ${isActionRequired ? 'var(--status-warn-border)' : 'var(--border)'}`,
          borderRadius: 6,
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isActionRequired ? (
            <AlertTriangle size={18} style={{ color: 'var(--status-warn-text)', flexShrink: 0 }} />
          ) : (
            <ShieldCheck size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
              {isActionRequired ? 'Action Required by Institution' : 'Current Status & Next Steps'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {nextStepText}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          rightIcon={<ArrowRight size={14} />}
          onClick={() => navigate(`/cases/${primaryCase.id}`)}
        >
          Open Application Workspace
        </Button>
      </div>

      {/* Composite Metric Row */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ReadinessRing score={primaryCase.readinessScore} size="md" />
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Readiness Score</div>
            <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700 }}>
              {primaryCase.readinessScore}%
            </div>
          </div>
        </div>

        <div style={{ height: 28, width: 1, background: 'var(--border)' }} />

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Assigned Scrutiny Officer</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {primaryCase.assignedOfficer || 'Regional Scrutiny Panel'}
          </div>
        </div>
      </div>
    </div>
  );
}
