import { useState } from 'react';
import { AlertOctagon, ChevronDown, ChevronUp, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import type { NotificationRecord } from '../../types/domain';

interface NotificationEscalationBannerProps {
  escalations: NotificationRecord[];
  onMarkAsRead: (id: string) => void;
}

export function NotificationEscalationBanner({
  escalations,
  onMarkAsRead,
}: NotificationEscalationBannerProps) {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();

  if (escalations.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--status-bad-tint)',
        border: '1.5px solid var(--status-bad-border)',
        borderRadius: 8,
        padding: 16,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Banner Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'var(--status-bad-solid)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertOctagon size={18} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--status-bad-text)',
                  letterSpacing: '-0.01em',
                }}
              >
                Statutory Regulatory Escalations ({escalations.length})
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: 'var(--status-bad-solid)',
                  color: '#ffffff',
                }}
              >
                ACTION REQUIRED
              </span>
            </div>

            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
              Mandatory APH SLA deadlines approaching breach or statutory deficiency cures overdue
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            rightIcon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          >
            {expanded ? 'Collapse' : `View (${escalations.length})`}
          </Button>
        </div>
      </div>

      {/* Expanded Escalation Cards List */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {escalations.map(esc => (
            <div
              key={esc.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--status-bad-border)',
                borderRadius: 6,
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
                <ShieldAlert size={16} style={{ color: 'var(--status-bad-solid)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {esc.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {esc.institutionName ? `${esc.institutionName} · ` : ''}
                    {esc.content}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {esc.caseId && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/cases/${esc.caseId}?tab=3`)}
                    rightIcon={<ArrowRight size={13} />}
                  >
                    Inspect SLA & Case
                  </Button>
                )}

                {!esc.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(esc.id)}
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
