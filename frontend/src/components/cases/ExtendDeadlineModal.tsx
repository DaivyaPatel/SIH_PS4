import React, { useState } from 'react';
import { Calendar, AlertCircle, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { extendDeadline } from '../../lib/api';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';

interface ExtendDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  applicationNumber: string;
  currentDeadlineAtIst?: string | null;
  onSuccess: () => void;
}

export function ExtendDeadlineModal({
  isOpen,
  onClose,
  caseId,
  applicationNumber,
  currentDeadlineAtIst,
  onSuccess,
}: ExtendDeadlineModalProps) {
  const { role } = useRole();
  const { addToast } = useToast();

  const [extensionDays, setExtensionDays] = useState(7);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (extensionDays < 1) {
      setError('Extension must be at least 1 business day.');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Please provide a statutory justification of at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await extendDeadline(caseId, {
        extensionDays,
        reason: reason.trim(),
        authorityRole: role,
        authorityId: `${role}-OFFICER`,
      });

      addToast({
        type: 'success',
        title: 'Statutory Deadline Extended',
        message: `Case ${applicationNumber} extended by ${extensionDays} business days.`,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extend deadline';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Extension Failed',
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
      title="Extend Statutory Deadline"
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Statutory Audit Warning */}
        <div
          style={{
            background: 'var(--status-warn-tint)',
            border: '1px solid var(--status-warn-border)',
            borderRadius: 6,
            padding: 12,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <ShieldAlert size={18} style={{ color: 'var(--status-warn)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: 'var(--status-warn-text)', lineHeight: 1.4 }}>
            <strong>Regulatory Compliance Notice:</strong> All deadline alterations are subject to AICTE Approval Process Handbook (APH) guidelines and are permanently recorded in the cryptographic audit trail.
          </div>
        </div>

        {/* Current Deadline Info */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            borderRadius: 6,
            padding: '10px 14px',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <span>Application: <strong>{applicationNumber}</strong></span>
          {currentDeadlineAtIst && (
            <span style={{ marginLeft: 16 }}>
              Current Deadline: <strong>{currentDeadlineAtIst}</strong>
            </span>
          )}
        </div>

        {/* Days Input */}
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
            Extension Days (Business Days)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              min={1}
              max={30}
              value={extensionDays}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setExtensionDays(parseInt(e.target.value, 10) || 1)
              }
              style={{
                width: 100,
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              days (maximum 30 statutory days)
            </span>
          </div>
        </div>

        {/* Reason Textarea */}
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
            Statutory Reason / Justification <span style={{ color: 'var(--status-bad)' }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Document administrative or regulatory basis for extension (min 10 characters)…"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
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

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            leftIcon={<Calendar size={14} />}
          >
            Confirm Extension
          </Button>
        </div>
      </form>
    </Modal>
  );
}
