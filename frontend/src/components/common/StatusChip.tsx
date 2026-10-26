import type { CaseStatus } from '../../types/domain';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileSearch,
  CalendarCheck,
  FileCheck,
} from 'lucide-react';

interface StatusChipProps {
  status: CaseStatus | string;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'sm' }: StatusChipProps) {
  let label = status.replace(/_/g, ' ');
  let bg = 'var(--status-info-tint)';
  let text = 'var(--status-info-text)';
  let border = 'var(--status-info-border)';
  let Icon = Clock;

  switch (status) {
    case 'APPROVED':
      label = 'Approved';
      bg = 'var(--status-ok-tint)';
      text = 'var(--status-ok-text)';
      border = 'var(--status-ok-border)';
      Icon = CheckCircle2;
      break;
    case 'REJECTED':
      label = 'Rejected';
      bg = 'var(--status-bad-tint)';
      text = 'var(--status-bad-text)';
      border = 'var(--status-bad-border)';
      Icon = XCircle;
      break;
    case 'DEFICIENCY_FLAGGED':
      label = 'Deficiency Flagged';
      bg = 'var(--status-bad-tint)';
      text = 'var(--status-bad-text)';
      border = 'var(--status-bad-border)';
      Icon = AlertTriangle;
      break;
    case 'DEFICIENCY_RESUBMITTED':
      label = 'Deficiency Resubmitted';
      bg = 'var(--status-warn-tint)';
      text = 'var(--status-warn-text)';
      border = 'var(--status-warn-border)';
      Icon = Clock;
      break;
    case 'UNDER_SCRUTINY':
      label = 'Under Scrutiny';
      bg = 'var(--status-info-tint)';
      text = 'var(--status-info-text)';
      border = 'var(--status-info-border)';
      Icon = FileSearch;
      break;
    case 'EVC_PENDING':
      label = 'EVC Pending';
      bg = 'var(--status-warn-tint)';
      text = 'var(--status-warn-text)';
      border = 'var(--status-warn-border)';
      Icon = Clock;
      break;
    case 'EVC_SCHEDULED':
      label = 'EVC Scheduled';
      bg = 'var(--status-ok-tint)';
      text = 'var(--status-ok-text)';
      border = 'var(--status-ok-border)';
      Icon = CalendarCheck;
      break;
    case 'EVC_COMPLETED':
      label = 'EVC Completed';
      bg = 'var(--status-ok-tint)';
      text = 'var(--status-ok-text)';
      border = 'var(--status-ok-border)';
      Icon = FileCheck;
      break;
    case 'SUBMITTED':
      label = 'Submitted';
      bg = 'var(--status-info-tint)';
      text = 'var(--status-info-text)';
      border = 'var(--status-info-border)';
      Icon = Clock;
      break;
  }

  const padding = size === 'sm' ? '3px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? 11 : 12;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: bg,
        color: text,
        border: `1px solid ${border}`,
        borderRadius: 9999,
        padding,
        fontSize,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
      }}
    >
      <Icon size={fontSize + 2} />
      <span>{label}</span>
    </span>
  );
}
