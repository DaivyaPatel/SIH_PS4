import type { CaseStatus } from '../../types/domain';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface StatusChipProps {
  status: CaseStatus | string;
  size?: 'sm' | 'md';
}

export function StatusChip({ status }: StatusChipProps) {
  // Status Taxonomy:
  // - Overdue: danger, alert-triangle icon, label "Overdue"
  // - Due soon: warning, clock icon, label "Due soon"
  // - Deficiency flagged: warning, triangle icon
  // - Under scrutiny / EVC scheduled / EVC pending: neutral plain text (no coloured tag)
  // - Approved: success, check icon
  // - Rejected: danger, x icon
  // Normal states are plain text without loud badges.

  if (status === 'APPROVED') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--status-ok-tint)',
          border: '1px solid var(--status-ok-border)',
          color: 'var(--status-ok-text)',
          fontWeight: 600,
          fontSize: 11,
        }}
      >
        <CheckCircle2 size={12} style={{ color: 'var(--status-ok)' }} />
        <span>Approved</span>
      </span>
    );
  }

  if (status === 'REJECTED') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--status-bad-tint)',
          border: '1px solid var(--status-bad-border)',
          color: 'var(--status-bad-text)',
          fontWeight: 600,
          fontSize: 11,
        }}
      >
        <XCircle size={12} style={{ color: 'var(--status-bad)' }} />
        <span>Rejected</span>
      </span>
    );
  }

  if (status === 'DEFICIENCY_FLAGGED') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '1px 6px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--status-warn-tint)',
          color: 'var(--status-warn-text)',
          border: '1px solid var(--status-warn-border)',
          fontWeight: 600,
          fontSize: 11,
        }}
      >
        <AlertTriangle size={12} />
        <span>Deficiency Flagged</span>
      </span>
    );
  }

  if (status === 'DEFICIENCY_RESUBMITTED') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '1px 6px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--status-info-tint)',
          color: 'var(--status-info-text)',
          border: '1px solid var(--status-info-border)',
          fontWeight: 600,
          fontSize: 11,
        }}
      >
        <span>Deficiency Resubmitted</span>
      </span>
    );
  }

  if (status === 'OVERDUE') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '1px 6px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--status-bad-tint)',
          color: 'var(--status-bad-text)',
          border: '1px solid var(--status-bad-border)',
          fontWeight: 600,
          fontSize: 11,
        }}
      >
        <AlertTriangle size={12} />
        <span>Overdue</span>
      </span>
    );
  }

  // Normal in-progress states: clean neutral plain text without colored backgrounds
  let label = status.replace(/_/g, ' ');
  if (status === 'UNDER_SCRUTINY') label = 'Under Scrutiny';
  else if (status === 'EVC_PENDING') label = 'EVC Pending';
  else if (status === 'EVC_SCHEDULED') label = 'EVC Scheduled';
  else if (status === 'EVC_COMPLETED') label = 'EVC Completed';
  else if (status === 'SUBMITTED') label = 'Submitted';

  return (
    <span
      style={{
        color: 'var(--text-secondary)',
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}
