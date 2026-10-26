import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { respondToDeficiency } from '../../lib/api';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';

interface RespondDeficiencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  deficiencyId: string;
  deficiencyDescription: string;
  onSuccess: () => void;
}

export function RespondDeficiencyModal({
  isOpen,
  onClose,
  caseId,
  deficiencyId,
  deficiencyDescription,
  onSuccess,
}: RespondDeficiencyModalProps) {
  const { role } = useRole();
  const { addToast } = useToast();

  const [proofDocumentName, setProofDocumentName] = useState('');
  const [responseComment, setResponseComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofDocumentName.trim()) {
      setError('Proof document name is required.');
      return;
    }
    if (!responseComment.trim()) {
      setError('Explanation comment is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await respondToDeficiency(caseId, deficiencyId, {
        proofDocumentName: proofDocumentName.trim(),
        proofDocumentUrl: `https://storage.aicte.gov.in/proofs/${encodeURIComponent(proofDocumentName.trim())}`,
        responseComment: responseComment.trim(),
        actorRole: role,
        actorId: `${role}-INSTITUTION`,
      });

      addToast({
        type: 'success',
        title: 'Compliance Response Uploaded',
        message: 'Your proof document and explanatory notes have been submitted for verification.',
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit deficiency response';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Submission Failed',
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
      title="Submit Deficiency Compliance Response"
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Deficiency Context Banner */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            borderRadius: 6,
            padding: 12,
            border: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Flagged Non-Compliance:
          </div>
          <div style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>
            &ldquo;{deficiencyDescription}&rdquo;
          </div>
        </div>

        {/* Proof Document Name */}
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
            Proof Document Title / Certification <span style={{ color: 'var(--status-bad)' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Fire Safety NOC Renewal 2026.pdf"
            value={proofDocumentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProofDocumentName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Compliance Explanation */}
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
            Compliance Explanation & Remediation Notes <span style={{ color: 'var(--status-bad)' }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Detail how this submission cures the cited deficiency…"
            value={responseComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseComment(e.target.value)}
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
            leftIcon={<Upload size={14} />}
          >
            Submit Compliance Proof
          </Button>
        </div>
      </form>
    </Modal>
  );
}
