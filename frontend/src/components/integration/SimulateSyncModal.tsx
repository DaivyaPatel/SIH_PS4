import { useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { syncPortal } from '../../lib/api';
import type { PortalSyncReceipt, Region } from '../../types/domain';

interface SimulateSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receipt: PortalSyncReceipt) => void;
}

export function SimulateSyncModal({
  isOpen,
  onClose,
  onSuccess,
}: SimulateSyncModalProps) {
  const [scenario, setScenario] = useState<'NEW' | 'DUPLICATE' | 'CUSTOM'>('NEW');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<PortalSyncReceipt | null>(null);
  const [copied, setCopied] = useState(false);

  // Form fields
  const [externalAppId, setExternalAppId] = useState('APP-2026-ERO-006');
  const [institutionCode, setInstitutionCode] = useState('1-60789012');
  const [institutionName, setInstitutionName] = useState('Kolkata Institute of Technology & Research');
  const [institutionType, setInstitutionType] = useState('ENGINEERING_AND_TECHNOLOGY');
  const [region, setRegion] = useState<Region>('ERO');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [applicationType, setApplicationType] = useState('EXTENSION_OF_APPROVAL');

  const handleScenarioChange = (s: 'NEW' | 'DUPLICATE' | 'CUSTOM') => {
    setScenario(s);
    setLastReceipt(null);
    setError(null);

    if (s === 'NEW') {
      const randNum = Math.floor(100 + Math.random() * 900);
      setExternalAppId(`APP-2026-ERO-${randNum}`);
      setInstitutionCode(`1-6078${randNum}`);
      setInstitutionName('Kolkata Institute of Technology & Research');
      setInstitutionType('ENGINEERING_AND_TECHNOLOGY');
      setRegion('ERO');
    } else if (s === 'DUPLICATE') {
      // Existing seed case in backend
      setExternalAppId('APP-2026-WRO-001');
      setInstitutionCode('1-1029384756');
      setInstitutionName('College of Engineering Pune');
      setInstitutionType('ENGINEERING_AND_TECHNOLOGY');
      setRegion('WRO');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLastReceipt(null);

    try {
      const receipt = await syncPortal({
        externalApplicationId: externalAppId.trim(),
        institutionCode: institutionCode.trim(),
        institutionName: institutionName.trim(),
        institutionType,
        region,
        academicYear,
        applicationType,
      });

      setLastReceipt(receipt);
      onSuccess(receipt);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Portal synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReceipt = () => {
    if (!lastReceipt) return;
    navigator.clipboard.writeText(JSON.stringify(lastReceipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulate National Approval Portal Ingestion"
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Scenario Selection Chips */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Choose Ingestion Test Scenario
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 'NEW' as const, title: 'Fresh Application', subtitle: 'New Case Creation' },
              { id: 'DUPLICATE' as const, title: 'Duplicate Case', subtitle: 'Idempotency Test' },
              { id: 'CUSTOM' as const, title: 'Custom Payload', subtitle: 'Manual Attributes' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleScenarioChange(item.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: `1px solid ${scenario === item.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: scenario === item.id ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: scenario === item.id ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {item.subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              External Application ID
            </label>
            <input
              type="text"
              value={externalAppId}
              onChange={e => setExternalAppId(e.target.value)}
              required
              disabled={scenario !== 'CUSTOM'}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: scenario === 'CUSTOM' ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              AICTE Institution Code
            </label>
            <input
              type="text"
              value={institutionCode}
              onChange={e => setInstitutionCode(e.target.value)}
              required
              disabled={scenario !== 'CUSTOM'}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: scenario === 'CUSTOM' ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
            Institution Name
          </label>
          <input
            type="text"
            value={institutionName}
            onChange={e => setInstitutionName(e.target.value)}
            required
            disabled={scenario !== 'CUSTOM'}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: scenario === 'CUSTOM' ? 'var(--bg-surface)' : 'var(--bg-subtle)',
              fontSize: 13,
              color: 'var(--text-primary)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Region
            </label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value as Region)}
              disabled={scenario !== 'CUSTOM'}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: scenario === 'CUSTOM' ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            >
              {(['WRO', 'SRO', 'NRO', 'ERO', 'CRO'] as const).map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              disabled
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Application Type
            </label>
            <select
              value={applicationType}
              onChange={e => setApplicationType(e.target.value)}
              disabled={scenario !== 'CUSTOM'}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: scenario === 'CUSTOM' ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            >
              <option value="EXTENSION_OF_APPROVAL">EoA (Extension of Approval)</option>
              <option value="NEW_PROGRAM">New Program / Institution</option>
              <option value="INCREASE_INTAKE">Increase in Intake</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            style={{
              padding: 12,
              background: 'var(--status-bad-tint)',
              border: '1px solid var(--status-bad-border)',
              borderRadius: 6,
              fontSize: 13,
              color: 'var(--status-bad-text)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Live Result Receipt Card */}
        {lastReceipt && (
          <div
            style={{
              background: lastReceipt.outcome === 'INGESTED' ? 'var(--status-ok-tint)' : 'var(--status-warn-tint)',
              border: `1px solid ${lastReceipt.outcome === 'INGESTED' ? 'var(--status-ok-border)' : 'var(--status-warn-border)'}`,
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: lastReceipt.outcome === 'INGESTED' ? 'var(--status-ok-solid)' : 'var(--status-warn-solid)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Receipt Generated: {lastReceipt.outcome}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyReceipt}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                }}
              >
                {copied ? <Check size={12} style={{ color: 'var(--status-ok-solid)' }} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {lastReceipt.message}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 11, fontFamily: 'monospace' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Receipt ID: </span>
                <span>{lastReceipt.receiptId.substring(0, 13)}…</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Correlation ID: </span>
                <span>{lastReceipt.correlationId.substring(0, 13)}…</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {lastReceipt ? 'Close' : 'Cancel'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={loading}
            leftIcon={loading ? <RefreshCw size={14} /> : <Play size={14} />}
          >
            {scenario === 'DUPLICATE' ? 'Trigger Duplicate Sync' : 'Execute Sync Payload'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
