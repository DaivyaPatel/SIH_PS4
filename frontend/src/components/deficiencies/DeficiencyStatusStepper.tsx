import { Check, Clock, AlertTriangle, FileCheck } from 'lucide-react';

interface DeficiencyStatusStepperProps {
  status: 'OPEN' | 'RESUBMITTED' | 'RESOLVED';
  compact?: boolean;
}

export function DeficiencyStatusStepper({ status, compact = false }: DeficiencyStatusStepperProps) {
  const steps = [
    {
      id: 'OPEN',
      label: 'Flagged & Open',
      subtext: 'Statutory cure window active',
      icon: AlertTriangle,
    },
    {
      id: 'RESUBMITTED',
      label: 'Proof Resubmitted',
      subtext: 'Awaiting officer re-review',
      icon: Clock,
    },
    {
      id: 'RESOLVED',
      label: 'Compliance Verified',
      subtext: 'Deficiency cleared',
      icon: FileCheck,
    },
  ];

  const getStepState = (stepIndex: number) => {
    const currentIndex = status === 'OPEN' ? 0 : status === 'RESUBMITTED' ? 1 : 2;
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 8 : 16,
        padding: compact ? '8px 10px' : '12px 16px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {steps.map((step, idx) => {
        const state = getStepState(idx);
        const isCurrent = state === 'current';
        const isCompleted = state === 'completed';

        let badgeBg = 'var(--bg-hover)';
        let badgeColor = 'var(--text-muted)';
        let badgeBorder = 'var(--border)';

        if (isCompleted) {
          badgeBg = 'var(--status-ok-tint)';
          badgeColor = 'var(--status-ok-text)';
          badgeBorder = 'var(--status-ok-border)';
        } else if (isCurrent) {
          if (status === 'OPEN') {
            badgeBg = 'var(--status-bad-tint)';
            badgeColor = 'var(--status-bad-text)';
            badgeBorder = 'var(--status-bad-border)';
          } else if (status === 'RESUBMITTED') {
            badgeBg = 'var(--status-info-tint)';
            badgeColor = 'var(--status-info-text)';
            badgeBorder = 'var(--status-info-border)';
          } else {
            badgeBg = 'var(--status-ok-tint)';
            badgeColor = 'var(--status-ok-text)';
            badgeBorder = 'var(--status-ok-border)';
          }
        }

        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flex: 1,
              position: 'relative',
            }}
          >
            {/* Step Circle */}
            <div
              style={{
                width: compact ? 22 : 28,
                height: compact ? 22 : 28,
                borderRadius: '50%',
                background: badgeBg,
                border: `1.5px solid ${badgeBorder}`,
                color: badgeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: compact ? 10 : 12,
                fontWeight: 700,
                transition: 'all 0.2s ease',
              }}
            >
              {isCompleted ? (
                <Check size={compact ? 12 : 14} strokeWidth={3} />
              ) : (
                <step.icon size={compact ? 11 : 13} />
              )}
            </div>

            {/* Step Label */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: compact ? 11 : 12,
                  fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                  color: isCurrent
                    ? 'var(--text-primary)'
                    : isCompleted
                    ? 'var(--text-secondary)'
                    : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {step.label}
              </div>
              {!compact && (
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {step.subtext}
                </div>
              )}
            </div>

            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  height: 2,
                  width: compact ? 12 : 20,
                  background: isCompleted ? 'var(--status-ok-solid)' : 'var(--border)',
                  flexShrink: 0,
                  borderRadius: 1,
                  margin: '0 2px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
