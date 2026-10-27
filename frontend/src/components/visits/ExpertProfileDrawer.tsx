import { useState } from 'react';
import {
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { useToast } from '../../context/ToastContext';
import type { ExpertDetail } from '../../types/domain';

interface ExpertProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expert: ExpertDetail | null;
}

export function ExpertProfileDrawer({
  isOpen,
  onClose,
  expert,
}: ExpertProfileDrawerProps) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!expert) return null;

  const copyEmail = () => {
    if (expert.email) {
      navigator.clipboard?.writeText(expert.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({
        type: 'info',
        title: 'Email Copied',
        message: 'Expert email address copied to clipboard.',
      });
    }
  };

  const conflictsList = Array.isArray(expert.conflictInstitutions)
    ? expert.conflictInstitutions
    : expert.conflictInstitutions
    ? expert.conflictInstitutions.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Expert Committee Profile"
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header Profile Card */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--accent-subtle)',
              border: '2px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {expert.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {expert.name}
              </h3>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: expert.active ? 'var(--status-ok-tint)' : 'var(--bg-hover)',
                  color: expert.active ? 'var(--status-ok-text)' : 'var(--text-muted)',
                  border: `1px solid ${expert.active ? 'var(--status-ok-border)' : 'var(--border)'}`,
                }}
              >
                {expert.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {expert.designation}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              <Building size={13} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {expert.affiliatedInstitution}
              </span>
            </div>
          </div>
        </div>

        {/* Credentials & Workload Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 14,
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
              Academic Domain
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
              {expert.domain.replace(/_/g, ' ')}
            </span>
          </div>

          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
              Regional Jurisdiction
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
              {expert.region} Region
            </span>
          </div>

          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
              Term Assignment Cap
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              Max {expert.maxAssignments} visits / cycle
            </span>
          </div>

          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
              Official Contact
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <a
                href={`mailto:${expert.email}`}
                style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
              >
                {expert.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Copy email"
              >
                {copied ? <Check size={12} color="var(--status-ok-solid)" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* Declared Institutional Conflicts (APH Chapter II, Section 4) */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} style={{ color: 'var(--status-warn-solid)' }} />
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Declared Institutional Conflicts ({conflictsList.length})
              </h4>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              APH Section 4.2
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Per statutory conflict-of-interest norms, this expert is disqualified from committee assignment to the following institutions:
          </p>

          {conflictsList.length === 0 ? (
            <div
              style={{
                fontSize: 12,
                color: 'var(--status-ok-text)',
                background: 'var(--status-ok-tint)',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--status-ok-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={14} />
              <span>Zero external institutional conflicts declared.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {conflictsList.map((conflict, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--status-bad-tint)',
                    border: '1px solid var(--status-bad-border)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 12,
                    color: 'var(--status-bad-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{conflict}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Inspection Dates */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} style={{ color: 'var(--accent)' }} />
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Available Inspection Windows ({expert.availableDates.length})
            </h4>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {expert.availableDates.length === 0 ? (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No availability recorded.</span>
            ) : (
              expert.availableDates.map(date => (
                <span
                  key={date}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: 'var(--status-ok-tint)',
                    border: '1px solid var(--status-ok-border)',
                    color: 'var(--status-ok-text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <CheckCircle2 size={12} />
                  {date}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Regulatory Governance Note */}
        <div
          style={{
            padding: 12,
            background: 'var(--bg-subtle)',
            borderRadius: 6,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            fontSize: 11,
            color: 'var(--text-muted)',
            lineHeight: 1.4,
          }}
        >
          <ShieldCheck size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
          <span>
            Identity and academic affiliations verified through the National Academic Depository (NAD). EVC expert assignments adhere to Google OR-Tools constraint satisfaction algorithms with 0 conflict tolerance.
          </span>
        </div>
      </div>
    </Drawer>
  );
}
