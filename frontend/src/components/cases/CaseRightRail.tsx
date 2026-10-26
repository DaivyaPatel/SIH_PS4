import { AlertCircle, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import type { CaseReadinessResponse } from '../../types/domain';
import { ReadinessRing } from '../common/ReadinessRing';

interface CaseRightRailProps {
  readiness: CaseReadinessResponse | null;
  onTabJump: (tabIndex: number) => void;
  onOpenFlagDeficiency?: () => void;
  onOpenExtendDeadline?: () => void;
}

export function CaseRightRail({
  readiness,
  onTabJump,
  onOpenFlagDeficiency,
  onOpenExtendDeadline,
}: CaseRightRailProps) {
  if (!readiness) {
    return (
      <div
        style={{
          width: 320,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Calculating case readiness…</div>
      </div>
    );
  }

  // Find individual criteria scores
  const getCriteria = (cat: string) => {
    return readiness.criteria.find(c => (c.category || c.criteriaKey) === cat) || {
      category: cat,
      criteriaKey: cat,
      earnedPoints: 0,
      maxPoints: cat === 'DOCUMENTS' || cat === 'DEFICIENCIES' ? 35 : cat === 'COMMITTEE' ? 20 : 10,
      scorePercentage: 0,
      status: 'PENDING',
      details: '',
    };
  };

  const docCriteria = getCriteria('DOCUMENTS');
  const defCriteria = getCriteria('DEFICIENCIES');
  const comCriteria = getCriteria('COMMITTEE');
  const dlnCriteria = getCriteria('DEADLINES');

  const scoreBars = [
    { label: 'Mandatory Documents', earned: docCriteria.earnedPoints, max: 35, tab: 2 },
    { label: 'Deficiency Clearance', earned: defCriteria.earnedPoints, max: 35, tab: 1 },
    { label: 'Committee Alignment', earned: comCriteria.earnedPoints, max: 20, tab: 3 },
    { label: 'Statutory Deadlines', earned: dlnCriteria.earnedPoints, max: 10, tab: 0 },
  ];

  return (
    <aside
      style={{
        width: 320,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* 4-Part Readiness Score Card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 18,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Readiness Breakdown
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              background: readiness.readyForNextStage ? 'var(--status-ok-tint)' : 'var(--status-warn-tint)',
              color: readiness.readyForNextStage ? 'var(--status-ok-text)' : 'var(--status-warn-text)',
              border: `1px solid ${readiness.readyForNextStage ? 'var(--status-ok-border)' : 'var(--status-warn-border)'}`,
            }}
          >
            {readiness.readinessTier.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Ring Center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <ReadinessRing score={readiness.readinessScore} size="lg" />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Overall composite compliance score out of 100 points
          </div>
        </div>

        {/* 4 Category Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scoreBars.map(bar => {
            const percent = Math.min(100, Math.round((bar.earned / bar.max) * 100));
            const isFull = bar.earned === bar.max;

            return (
              <div
                key={bar.label}
                onClick={() => onTabJump(bar.tab)}
                style={{ cursor: 'pointer' }}
                title={`Click to view ${bar.label}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{bar.label}</span>
                  <span className="tabular-nums" style={{ fontWeight: 600, color: isFull ? 'var(--status-ok-text)' : 'var(--text-primary)' }}>
                    {bar.earned} / {bar.max} pts
                  </span>
                </div>

                {/* Progress track */}
                <div
                  style={{
                    height: 6,
                    background: 'var(--bg-subtle)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      background: isFull
                        ? 'var(--status-ok)'
                        : percent > 50
                        ? 'var(--accent)'
                        : 'var(--status-warn)',
                      borderRadius: 3,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Blocking Prerequisites */}
      {readiness.blockingPrerequisites.length > 0 && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--status-warn-border)',
            borderRadius: 8,
            padding: 16,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <AlertCircle size={16} style={{ color: 'var(--status-warn)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-warn-text)' }}>
              Blocking Prerequisites ({readiness.blockingPrerequisites.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {readiness.blockingPrerequisites.map((bp, index) => {
              const guide = bp.resolutionGuide || bp.remedyAction;
              return (
                <div
                  key={bp.id || bp.code || index}
                  onClick={() => {
                    if (bp.category === 'DEFICIENCIES') onTabJump(1);
                    else if (bp.category === 'DOCUMENTS') onTabJump(2);
                    else if (bp.category === 'COMMITTEE') onTabJump(3);
                    else onTabJump(0);
                  }}
                  style={{
                    background: 'var(--status-warn-tint)',
                    borderRadius: 6,
                    padding: 10,
                    cursor: 'pointer',
                    border: '1px solid var(--status-warn-border)',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, color: 'var(--status-warn-text)' }}>{bp.category}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--status-bad-text)',
                        background: 'var(--status-bad-tint)',
                        padding: '1px 5px',
                        borderRadius: 3,
                      }}
                    >
                      {bp.severity}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginBottom: 4 }}>{bp.description}</div>
                  {guide && (
                    <div style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{guide}</span>
                      <ChevronRight size={11} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Next Actions */}
      {(() => {
        const actions = readiness.recommendedNextActions || readiness.recommendedActions || [];
        if (actions.length === 0) return null;

        return (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Zap size={15} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Recommended Actions
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actions.map((ra, idx) => {
                const actionCode = ra.actionType || ra.actionCode;
                const assignedRole = ra.targetRole || ra.assignedRole || 'OFFICER';

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (actionCode === 'CLEAR_DEFICIENCY') onTabJump(1);
                      else if (actionCode === 'VERIFY_DOCUMENT') onTabJump(2);
                      else if (actionCode === 'SCHEDULE_EVC') onTabJump(3);
                      else if (actionCode === 'EXTEND_DEADLINE' && onOpenExtendDeadline) onOpenExtendDeadline();
                      else if (actionCode === 'FLAG_DEFICIENCY' && onOpenFlagDeficiency) onOpenFlagDeficiency();
                    }}
                    style={{
                      background: 'var(--bg-subtle)',
                      borderRadius: 6,
                      padding: 10,
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {ra.description}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Role: {assignedRole.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </aside>
  );
}
