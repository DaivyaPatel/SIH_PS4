import { Clock, AlertCircle } from 'lucide-react';

interface DeadlineChipProps {
  isOverdue?: boolean;
  remainingHours?: number;
  remainingBusinessDays?: number;
  deadlineStatus?: string;
  deadlineAtIst?: string | null;
  size?: 'sm' | 'md';
}

export function DeadlineChip({
  isOverdue = false,
  remainingHours = 0,
  remainingBusinessDays = 0,
  deadlineStatus = 'ON_TRACK',
  deadlineAtIst,
  size = 'sm',
}: DeadlineChipProps) {
  let label: string;
  let bg = 'var(--status-ok-tint)';
  let text = 'var(--status-ok-text)';
  let border = 'var(--status-ok-border)';
  let Icon = Clock;

  if (isOverdue || deadlineStatus === 'OVERDUE') {
    const overdueHrs = Math.abs(remainingHours);
    label = overdueHrs > 48 ? `${Math.floor(overdueHrs / 24)}d overdue` : `${overdueHrs}h overdue`;
    bg = 'var(--status-bad-tint)';
    text = 'var(--status-bad-text)';
    border = 'var(--status-bad-border)';
    Icon = AlertCircle;
  } else if (deadlineStatus === 'APPROACHING_DEADLINE' || (remainingHours > 0 && remainingHours <= 48)) {
    label = `${remainingHours}h left`;
    bg = 'var(--status-warn-tint)';
    text = 'var(--status-warn-text)';
    border = 'var(--status-warn-border)';
    Icon = Clock;
  } else if (remainingBusinessDays > 0) {
    label = `${remainingBusinessDays}d left`;
    bg = 'var(--status-ok-tint)';
    text = 'var(--status-ok-text)';
    border = 'var(--status-ok-border)';
    Icon = Clock;
  } else if (deadlineAtIst) {
    label = deadlineAtIst.split(' ')[0] || 'Scheduled';
  } else {
    label = 'No deadline';
    bg = 'var(--bg-subtle)';
    text = 'var(--text-muted)';
    border = 'var(--border)';
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? 11 : 12;

  return (
    <span
      className="tabular-nums"
      title={deadlineAtIst ? `Statutory Deadline: ${deadlineAtIst}` : undefined}
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
      }}
    >
      <Icon size={fontSize + 1} />
      <span>{label}</span>
    </span>
  );
}
