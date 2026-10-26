import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  MoreVertical,
  Calendar,
  XCircle,
  Download,
} from 'lucide-react';
import type { CaseDetail, CaseReadinessResponse, CaseStatus } from '../../types/domain';
import { StatusChip } from '../common/StatusChip';
import { DeadlineChip } from '../common/DeadlineChip';
import { ReadinessRing } from '../common/ReadinessRing';
import { Button } from '../common/Button';
import { useRole } from '../../context/RoleContext';
import { executeTransition } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface CaseDetailHeaderProps {
  caseData: CaseDetail;
  readiness: CaseReadinessResponse | null;
  onOpenExtendDeadline: () => void;
  onRefresh: () => void;
  onTabJump: (tabIndex: number) => void;
}

export function CaseDetailHeader({
  caseData,
  readiness,
  onOpenExtendDeadline,
  onRefresh,
  onTabJump,
}: CaseDetailHeaderProps) {
  const navigate = useNavigate();
  const { role, permissions } = useRole();
  const { addToast } = useToast();

  const [transitioning, setTransitioning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 5 statutory workflow steps
  const steps: Array<{ key: CaseStatus; label: string; tabIndex: number }> = [
    { key: 'SUBMITTED', label: '1. Intake', tabIndex: 0 },
    { key: 'UNDER_SCRUTINY', label: '2. Scrutiny', tabIndex: 2 },
    { key: 'DEFICIENCY_FLAGGED', label: '3. Deficiency', tabIndex: 1 },
    { key: 'EVC_PENDING', label: '4. Expert Visit', tabIndex: 3 },
    { key: 'APPROVED', label: '5. Decision', tabIndex: 4 },
  ];

  const getStepState = (stepKey: CaseStatus): 'completed' | 'active' | 'upcoming' => {
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

    const currentOrder = statusOrder[caseData.status] || 1;
    const thisOrder = statusOrder[stepKey] || 1;

    if (caseData.status === 'APPROVED' || caseData.status === 'REJECTED') {
      if (stepKey === 'APPROVED' || stepKey === 'REJECTED') {
        return 'active';
      }
      return 'completed';
    }

    if (thisOrder < currentOrder) return 'completed';
    if (thisOrder === currentOrder) return 'active';
    return 'upcoming';
  };

  // Determine Primary Transition Action based on current stage
  const getPrimaryActionConfig = () => {
    if (caseData.status === 'SUBMITTED' || caseData.status === 'DRAFT') {
      return {
        label: 'Pass Intake Scrutiny',
        action: 'SCRUTINY_PASS',
        allowedRoles: ['REGIONAL_OFFICER', 'SCRUTINY_OFFICER'],
      };
    }
    if (caseData.status === 'UNDER_SCRUTINY') {
      return {
        label: 'Pass Document Scrutiny',
        action: 'SCRUTINY_PASS',
        allowedRoles: ['REGIONAL_OFFICER', 'SCRUTINY_OFFICER'],
      };
    }
    if (caseData.status === 'DEFICIENCY_FLAGGED') {
      return {
        label: 'All Deficiencies Cleared',
        action: 'SCRUTINY_PASS',
        allowedRoles: ['REGIONAL_OFFICER', 'SCRUTINY_OFFICER'],
      };
    }
    if (caseData.status === 'EVC_PENDING') {
      return {
        label: 'Complete EVC & Recommend Approval',
        action: 'RECOMMEND_APPROVAL',
        allowedRoles: ['REGIONAL_OFFICER', 'EVC_EXPERT'],
      };
    }
    return null;
  };

  const primaryConfig = getPrimaryActionConfig();
  const hasPrerequisites = (readiness?.blockingPrerequisites?.length ?? 0) > 0;
  const isRoleAllowed = primaryConfig ? primaryConfig.allowedRoles.includes(role) : false;
  const isActionDisabled = !isRoleAllowed || hasPrerequisites || transitioning;

  const handleExecuteTransition = async (action: string) => {
    setTransitioning(true);
    try {
      await executeTransition(caseData.id, {
        action,
        actorRole: role,
        actorId: `${role}-USER`,
        comment: `Transition executed from Case Detail Workspace via guarded action engine.`,
      });

      addToast({
        type: 'success',
        title: 'Workflow Transition Completed',
        message: `Case ${caseData.applicationNumber} advanced successfully.`,
      });

      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transition execution failed';
      addToast({
        type: 'error',
        title: 'Workflow Action Blocked',
        message: msg,
      });
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '18px 22px',
        marginBottom: 20,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Top Row: Back link & quick status badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <button
          onClick={() => navigate('/cases')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Cases List</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusChip status={caseData.status} size="md" />
          <DeadlineChip
            isOverdue={caseData.isOverdue}
            remainingHours={caseData.remainingHours}
            remainingBusinessDays={caseData.remainingBusinessDays}
            deadlineStatus={caseData.deadlineStatus}
            deadlineAtIst={caseData.deadlineAtIst}
            size="md"
          />
        </div>
      </div>

      {/* Main Title Strip & Action Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}
          >
            {caseData.institution.name}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>
              {caseData.applicationNumber}
            </span>
            <span>·</span>
            <span>Academic Year {caseData.academicYear}</span>
            <span>·</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 4,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
              }}
            >
              Region {caseData.institution.region}
            </span>
            <span>·</span>
            <span>{caseData.applicationType.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Action Controls & Readiness Ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {readiness && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ReadinessRing score={readiness.readinessScore} size="md" />
            </div>
          )}

          {/* Primary Guarded Transition Button */}
          {primaryConfig && (
            <div style={{ position: 'relative' }}>
              <Button
                variant={isActionDisabled ? 'secondary' : 'primary'}
                disabled={isActionDisabled}
                isLoading={transitioning}
                leftIcon={isActionDisabled ? <Lock size={14} /> : <ShieldCheck size={14} />}
                onClick={() => handleExecuteTransition(primaryConfig.action)}
              >
                {primaryConfig.label}
              </Button>
            </div>
          )}

          {/* Overflow Menu Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '7px 9px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 6,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 20,
                  minWidth: 180,
                  overflow: 'hidden',
                }}
              >
                {permissions.canExtendDeadlines && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenExtendDeadline();
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <Calendar size={14} />
                    <span>Extend Deadline</span>
                  </button>
                )}

                {permissions.canRejectApplications && caseData.status !== 'REJECTED' && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (confirm(`Confirm statutory rejection for application ${caseData.applicationNumber}?`)) {
                        handleExecuteTransition('REJECT');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      cursor: 'pointer',
                      color: 'var(--status-bad-text)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--status-bad-tint)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <XCircle size={14} />
                    <span>Reject Application</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    const jsonStr = JSON.stringify(caseData, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `case-${caseData.applicationNumber}-export.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <Download size={14} />
                  <span>Export Case JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guarded Action Blocked Banner if prerequisites exist */}
      {primaryConfig && hasPrerequisites && (
        <div
          style={{
            background: 'var(--status-warn-tint)',
            border: '1px solid var(--status-warn-border)',
            borderRadius: 6,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} style={{ color: 'var(--status-warn)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--status-warn-text)' }}>
              <strong>Workflow Advancement Blocked:</strong>{' '}
              {readiness?.blockingPrerequisites[0]?.description ||
                'Statutory prerequisites must be resolved prior to advancing.'}
            </span>
          </div>

          <button
            onClick={() => {
              const cat = readiness?.blockingPrerequisites[0]?.category;
              if (cat === 'DEFICIENCIES') onTabJump(1);
              else if (cat === 'DOCUMENTS') onTabJump(2);
              else onTabJump(0);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Resolve Prerequisite</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 5-Stage Milestone Stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}
      >
        {steps.map(step => {
          const state = getStepState(step.key);

          let borderColor = 'var(--border)';
          let bgColor = 'var(--bg-subtle)';
          let textColor = 'var(--text-muted)';
          let Icon = Clock;

          if (state === 'completed') {
            borderColor = 'var(--status-ok)';
            bgColor = 'var(--status-ok-tint)';
            textColor = 'var(--status-ok-text)';
            Icon = CheckCircle;
          } else if (state === 'active') {
            borderColor = 'var(--accent)';
            bgColor = 'var(--accent-subtle)';
            textColor = 'var(--accent)';
            Icon = ShieldCheck;
          }

          return (
            <button
              key={step.key}
              onClick={() => onTabJump(step.tabIndex)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 6,
                border: `1px solid ${borderColor}`,
                background: bgColor,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} style={{ color: textColor, flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: state === 'active' ? 700 : 600,
                    color: textColor,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {step.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
