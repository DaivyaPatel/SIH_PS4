import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import { deriveCaseState } from '../../lib/caseLogic';
import { getCaseById, getCaseAudit } from '../../lib/api';
import { StageStepper } from './StageStepper';
import { StatusChip } from './StatusChip';
import type { CaseDetail, CaseSummary, AuditEventRecord } from '../../types/domain';

interface CaseSidePanelProps {
  caseSummary: CaseSummary | null;
  onClose: () => void;
  originatingElement?: HTMLElement | null;
}

export function CaseSidePanel({ caseSummary, onClose, originatingElement }: CaseSidePanelProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEventRecord[]>([]);

  // Focus trapping and Esc key handler
  useEffect(() => {
    if (!caseSummary) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on close button
    const closeBtn = panelRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Close side panel"]');
    if (closeBtn) closeBtn.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Return focus to originating element on close
      if (originatingElement && typeof originatingElement.focus === 'function') {
        originatingElement.focus();
      }
    };
  }, [caseSummary, onClose, originatingElement]);

  // Load full detail & audit logs
  useEffect(() => {
    if (!caseSummary) {
      setDetail(null);
      setAuditEvents([]);
      return;
    }

    getCaseById(caseSummary.id)
      .then(d => setDetail(d))
      .catch(() => {});

    getCaseAudit(caseSummary.id)
      .then(events => setAuditEvents(events.slice(0, 5)))
      .catch(() => {});
  }, [caseSummary]);

  if (!caseSummary) return null;

  const derived = deriveCaseState(caseSummary);
  const defs = detail?.deficiencies || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Case Details: ${caseSummary.applicationNumber}`}
      ref={panelRef}
      style={{
        position: 'fixed',
        top: 48,
        right: 0,
        bottom: 0,
        width: 380,
        maxWidth: '90vw',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 55,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          background: 'var(--bg-subtle)',
        }}
      >
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {caseSummary.applicationNumber}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginTop: 2 }}>
            {caseSummary.institutionName}
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close side panel"
          style={{
            background: 'transparent',
            border: 0,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Section 1: Summary */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Summary
          </div>
          <div
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-page)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stage</span>
              <StageStepper status={caseSummary.status} hasDeficiencyWarning={derived.hasDeficiencyWarning} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</span>
              <StatusChip status={caseSummary.status} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Readiness</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${caseSummary.readinessScore}%`,
                      background: caseSummary.readinessScore >= 80 ? 'var(--status-ok)' : caseSummary.readinessScore >= 50 ? 'var(--status-warn)' : 'var(--status-bad)',
                    }}
                  />
                </div>
                <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {caseSummary.readinessScore}%
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Region</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{derived.region}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Next Action & Deadline */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Next Action & Statutory Deadline
          </div>
          <div
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-page)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Responsible party</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserCheck size={13} style={{ color: 'var(--text-muted)' }} />
                <span style={{ textTransform: 'capitalize' }}>{derived.ballInCourt}</span>
                {derived.needsOfficerAction && (
                  <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'var(--accent-subtle)', color: 'var(--accent)', fontWeight: 600 }}>
                    Needs you
                  </span>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Action required</div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2 }}>
                {derived.why}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Statutory due time</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: derived.clockState === 'overdue' ? 'var(--status-bad)' : 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} />
                <span>{derived.nextDeadlineIst}</span>
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>({derived.relativeTimeText})</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Open Deficiencies */}
        {defs.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Open Deficiencies ({defs.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {defs.map(d => (
                <div
                  key={d.id}
                  style={{
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-page)',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--status-warn-text)' }}>
                    <AlertTriangle size={12} />
                    <span>{d.category.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                    {d.description}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Recent Activity */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Recent Statutory Activity
          </div>
          {auditEvents.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No audit records logged yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {auditEvents.map(e => (
                <div
                  key={e.id}
                  style={{
                    padding: '6px 8px',
                    borderLeft: '2px solid var(--border-strong)',
                    fontSize: 11,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.action.replace(/_/g, ' ')}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{e.actor} ({e.role})</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{e.details}</div>
                  <div className="tabular-nums" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {new Date(e.timestamp || e.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer: Open Full Case Link */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={() => {
            onClose();
            navigate(`/cases/${caseSummary.id}`);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span>Open full case</span>
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}
