import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { resolveDeficiency } from '../../lib/api';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';

interface ResolveDeficiencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  deficiencyId: string;
  deficiencyDescription: string;
  proofDocumentName?: string | null;
  onSuccess: () => void;
}

export function ResolveDeficiencyModal({
  isOpen,
  onClose,
  caseId,
  deficiencyId,
  deficiencyDescription,
  proofDocumentName,
  onSuccess,
}: ResolveDeficiencyModalProps) {
  const { role } = useRole();
  const { addToast } = useToast();

  const [resolutionComment, setResolutionComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resolveDeficiency(caseId, deficiencyId, {
        resolutionComment: resolutionComment.trim() || 'Verified compliance document and approved.',
        actorRole: role,
        actorId: `${role}-OFFICER`,
      });

      addToast({
        type: 'success',
        title: 'Deficiency Resolved',
        message: 'The deficiency has been cleared. Case readiness recalculated automatically.',
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resolve deficiency';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Resolution Failed',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify & Resolve Deficiency"
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Verification Context */}
        <div
          style={{
            background: 'var(--status-ok-tint)',
            border: '1px solid var(--status-ok-border)',
            borderRadius: 6,
            padding: 12,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <CheckCircle2 size={18} style={{ color: 'var(--status-ok)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: 'var(--status-ok-text)', lineHeight: 1.4 }}>
            Clearing this deficiency grants <strong>+35 readiness points</strong> if all deficiencies are settled, unblocking subsequent workflow progression to Expert Visit Committee (EVC).
          </div>
        </div>

        {/* Item & Proof Overview */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            borderRadius: 6,
            padding: 12,
            border: '1px solid var(--border)',
            fontSize: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Deficiency: </strong>
            <span style={{ color: 'var(--text-secondary)' }}>{deficiencyDescription}</span>
          </div>
          {proofDocumentName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} style={{ color: 'var(--accent)' }} />
              <strong style={{ color: 'var(--text-primary)' }}>Attached Proof: </strong>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{proofDocumentName}</span>
            </div>
          )}
        </div>

        {/* Resolution Notes */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}
          >
            Verification & Clearance Remarks
          </label>
          <textarea
            rows={3}
            placeholder="State verification observations confirming full regulatory compliance…"
            value={resolutionComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResolutionComment(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--status-bad-text)',
              background: 'var(--status-bad-tint)',
              border: '1px solid var(--status-bad-border)',
              borderRadius: 4,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            leftIcon={<CheckCircle2 size={14} />}
          >
            Approve & Clear Deficiency
          </Button>
        </div>
      </form>
    </Modal>
  );
}
