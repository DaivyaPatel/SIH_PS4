import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon = <Inbox size={36} color="var(--text-muted)" />,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        border: '1px dashed var(--border)',
        borderRadius: 8,
      }}
    >
      <div style={{ marginBottom: 12 }}>{icon}</div>
      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 400 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
