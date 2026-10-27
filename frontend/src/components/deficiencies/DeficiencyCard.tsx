import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { DeficiencyCategoryChip } from './DeficiencyCategoryChip';
import { DeficiencyStatusStepper } from './DeficiencyStatusStepper';
import { DeficiencyResponsePanel } from './DeficiencyResponsePanel';
import { ResolveDeficiencyModal } from '../cases/ResolveDeficiencyModal';
import { Button } from '../common/Button';
import { useRole } from '../../context/RoleContext';
import type { DeficiencyDetail } from '../../types/domain';

interface DeficiencyCardProps {
  deficiency: DeficiencyDetail;
  caseId: string;
  applicationNumber?: string;
  onRefresh: () => void;
  onPreviewProof?: (docName: string, docUrl?: string | null) => void;
  defaultExpanded?: boolean;
}

export function DeficiencyCard({
  deficiency,
  caseId,
  onRefresh,
  onPreviewProof,
  defaultExpanded = false,
}: DeficiencyCardProps) {
  const { role, permissions } = useRole();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isResponding, setIsResponding] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const isResolved = deficiency.status === 'RESOLVED';
  const isResubmitted = deficiency.status === 'RESUBMITTED';
  const isOpen = deficiency.status === 'OPEN';

  const canResolve = permissions.canFlagDeficiencies || role === 'REGIONAL_OFFICER' || role === 'SCRUTINY_OFFICER';
  const canRespond = role === 'INSTITUTION_ADMIN' || role === 'SCRUTINY_OFFICER'; // allow demo toggles

  let statusBg = 'var(--status-bad-tint)';
  let statusColor = 'var(--status-bad-text)';
  let statusBorder = 'var(--status-bad-border)';

  if (isResolved) {
    statusBg = 'var(--status-ok-tint)';
    statusColor = 'var(--status-ok-text)';
    statusBorder = 'var(--status-ok-border)';
  } else if (isResubmitted) {
    statusBg = 'var(--status-info-tint)';
    statusColor = 'var(--status-info-text)';
    statusBorder = 'var(--status-info-border)';
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${isResolved ? 'var(--status-ok-border)' : 'var(--border)'}`,
        borderRadius: 8,
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* Card Header (Clickable to toggle expand) */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          cursor: 'pointer',
          background: isExpanded ? 'var(--bg-subtle)' : 'var(--bg-surface)',
          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <DeficiencyCategoryChip category={deficiency.category} />

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                background: statusBg,
                color: statusColor,
                border: `1px solid ${statusBorder}`,
                letterSpacing: '0.02em',
              }}
            >
              {deficiency.status}
            </span>

            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Cure window: <strong>{deficiency.deadlineDays} days</strong>
            </span>
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: isExpanded ? undefined : 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {deficiency.description}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 2 }}>
          {isResubmitted && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--status-info-text)',
                background: 'var(--status-info-tint)',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              Proof Ready
            </span>
          )}

          <button
            type="button"
            aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Accordion Body */}
      {isExpanded && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status Stepper */}
          <DeficiencyStatusStepper status={deficiency.status} />

          {/* Observation Details */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Statutory Non-Compliance Observation
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {deficiency.description}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 16,
                fontSize: 11,
                color: 'var(--text-muted)',
                marginTop: 4,
                borderTop: '1px dashed var(--border)',
                paddingTop: 8,
              }}
            >
              <span>
                Flagged Date: <strong>{new Date(deficiency.flaggedAt).toLocaleDateString()}</strong>
              </span>
              <span>
                Statutory Allowance: <strong>{deficiency.deadlineDays} business days</strong>
              </span>
            </div>
          </div>

          {/* OPEN State: Remediation Area */}
          {isOpen && (
            <div>
              {isResponding ? (
                <DeficiencyResponsePanel
                  caseId={caseId}
                  deficiencyId={deficiency.id}
                  onCancel={() => setIsResponding(false)}
                  onSuccess={() => {
                    setIsResponding(false);
                    onRefresh();
                  }}
                />
              ) : (
                <div
                  style={{
                    background: 'var(--status-bad-tint)',
                    border: '1px solid var(--status-bad-border)',
                    borderRadius: 6,
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} style={{ color: 'var(--status-bad-text)', flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: 'var(--status-bad-text)' }}>
                      Application is halted in <strong>DEFICIENCY_FLAGGED</strong>. Institution must cure this defect within the statutory deadline.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {canRespond && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Send size={13} />}
                        onClick={() => setIsResponding(true)}
                      >
                        Respond & Upload Proof
                      </Button>
                    )}

                    {canResolve && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<CheckCircle2 size={13} />}
                        onClick={() => setIsResolveModalOpen(true)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RESUBMITTED State: Proof Document & Review Actions */}
          {isResubmitted && (
            <div
              style={{
                background: 'var(--status-info-tint)',
                border: '1px solid var(--status-info-border)',
                borderRadius: 6,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} style={{ color: 'var(--status-info-text)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-info-text)' }}>
                    Compliance Response Received & Awaiting Verification
                  </span>
                </div>

                {canResolve && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 size={13} />}
                    onClick={() => setIsResolveModalOpen(true)}
                  >
                    Verify & Resolve
                  </Button>
                )}
              </div>

              {/* Response Note */}
              {deficiency.resolutionComment && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    background: 'var(--bg-surface)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                  }}
                >
                  <strong style={{ color: 'var(--text-secondary)' }}>Institution Note: </strong>
                  {deficiency.resolutionComment}
                </div>
              )}

              {/* Proof Document Link */}
              {deficiency.proofDocumentName && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {deficiency.proofDocumentName}
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Eye size={13} />}
                    onClick={() => {
                      if (onPreviewProof) {
                        onPreviewProof(deficiency.proofDocumentName || 'Proof Document', deficiency.proofDocumentUrl);
                      }
                    }}
                  >
                    Preview Proof
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* RESOLVED State: Verified Banner */}
          {isResolved && (
            <div
              style={{
                background: 'var(--status-ok-tint)',
                border: '1px solid var(--status-ok-border)',
                borderRadius: 6,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--status-ok-solid)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-ok-text)' }}>
                    Compliance Verified & Deficiency Cleared
                  </span>
                </div>

                {deficiency.resolvedAt && (
                  <span style={{ fontSize: 11, color: 'var(--status-ok-text)' }}>
                    Resolved: {new Date(deficiency.resolvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {deficiency.resolutionComment && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--status-ok-text)',
                    background: 'var(--bg-surface)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--status-ok-border)',
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>Clearance Record: </strong>
                  {deficiency.resolutionComment}
                </div>
              )}

              {deficiency.proofDocumentName && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '6px 12px',
                    marginTop: 2,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={14} style={{ color: 'var(--status-ok-solid)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Accepted Proof: <strong>{deficiency.proofDocumentName}</strong>
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye size={12} />}
                    onClick={() => {
                      if (onPreviewProof) {
                        onPreviewProof(deficiency.proofDocumentName || 'Proof Document', deficiency.proofDocumentUrl);
                      }
                    }}
                  >
                    View Proof
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resolve Modal */}
      {isResolveModalOpen && (
        <ResolveDeficiencyModal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          caseId={caseId}
          deficiencyId={deficiency.id}
          deficiencyDescription={deficiency.description}
          proofDocumentName={deficiency.proofDocumentName}
          onSuccess={() => {
            setIsResolveModalOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
