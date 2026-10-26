import React, { useState } from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { flagDeficiency } from '../../lib/api';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';

interface FlagDeficiencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  applicationNumber: string;
  onSuccess: () => void;
}

export function FlagDeficiencyModal({
  isOpen,
  onClose,
  caseId,
  applicationNumber,
  onSuccess,
}: FlagDeficiencyModalProps) {
  const { role } = useRole();
  const { addToast } = useToast();

  const [category, setCategory] = useState('LAND_AND_BUILDING');
  const [description, setDescription] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { key: 'LAND_AND_BUILDING', label: 'Land & Building Norms' },
    { key: 'FACULTY_CREDENTIALS', label: 'Faculty Credentials & Cadre Ratio' },
    { key: 'FIRE_SAFETY_NOC', label: 'Fire Safety NOC & Structural Stability' },
    { key: 'FINANCIAL_DEPOSIT', label: 'Fixed Deposit Receipt (FDR) / Endowment' },
    { key: 'ACADEMIC_INFRASTRUCTURE', label: 'Academic & Laboratory Infrastructure' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Deficiency description is required.');
      return;
    }
    if (deadlineDays < 1) {
      setError('Cure deadline must be at least 1 day.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await flagDeficiency(caseId, {
        category,
        description: description.trim(),
        deadlineDays,
        actorRole: role,
        actorId: `${role}-OFFICER`,
      });

      addToast({
        type: 'warning',
        title: 'Deficiency Flagged',
        message: `New deficiency registered for application ${applicationNumber}. Cure clock activated.`,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to flag deficiency';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Flagging Failed',
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
      title="Flag Statutory Deficiency"
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            background: 'var(--status-bad-tint)',
            border: '1px solid var(--status-bad-border)',
            borderRadius: 6,
            padding: 12,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={18} style={{ color: 'var(--status-bad-text)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: 'var(--status-bad-text)', lineHeight: 1.4 }}>
            Flagging a deficiency shifts the application state to <strong>DEFICIENCY_FLAGGED</strong> and initiates a statutory cure clock for the institution.
          </div>
        </div>

        {/* Category */}
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
            Deficiency Category <span style={{ color: 'var(--status-bad)' }}>*</span>
          </label>
          <select
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {categories.map(cat => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
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
            Specific Observation & Non-Compliance Item <span style={{ color: 'var(--status-bad)' }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Explain exactly what statutory criterion is missing or non-compliant…"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
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

        {/* Cure Deadline Days */}
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
            Cure Window (Days Granted to Institution)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              min={1}
              max={30}
              value={deadlineDays}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDeadlineDays(parseInt(e.target.value, 10) || 1)
              }
              style={{
                width: 90,
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
              days to upload proof of compliance (standard: 7 days)
            </span>
          </div>
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
            variant="destructive"
            isLoading={loading}
            leftIcon={<AlertTriangle size={14} />}
          >
            Flag Deficiency
          </Button>
        </div>
      </form>
    </Modal>
  );
}
