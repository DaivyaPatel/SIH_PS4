import { Check, AlertTriangle } from 'lucide-react';
import { getStageStep } from '../../lib/caseLogic';
import type { CaseStatus } from '../../types/domain';

interface StageStepperProps {
  status: CaseStatus;
  hasDeficiencyWarning?: boolean;
}

export function StageStepper({ status, hasDeficiencyWarning = false }: StageStepperProps) {
  const { step: currentStep, name: stageName } = getStageStep(status);
  const totalSteps = 5;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {/* 5-step stepper dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep || (stepNum === 5 && status === 'APPROVED');
          const isCurrent = stepNum === currentStep && status !== 'APPROVED';
          const isDeficientStep = stepNum === 3 && hasDeficiencyWarning;

          let bg = 'var(--border)';
          let border = '1px solid var(--border-strong)';
          let content = null;

          if (isDeficientStep) {
            bg = 'var(--status-warn-tint)';
            border = '1px solid var(--status-warn)';
            content = <AlertTriangle size={8} style={{ color: 'var(--status-warn)' }} />;
          } else if (isCompleted) {
            bg = 'var(--status-ok-tint)';
            border = '1px solid var(--status-ok)';
            content = <Check size={8} style={{ color: 'var(--status-ok)' }} strokeWidth={3} />;
          } else if (isCurrent) {
            bg = 'var(--accent)';
            border = '1px solid var(--accent)';
          }

          return (
            <div
              key={stepNum}
              title={`Step ${stepNum} of 5`}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: bg,
                border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              {content}
            </div>
          );
        })}
      </div>

      {/* Stage name as plain text */}
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {stageName}
      </span>
    </div>
  );
}
