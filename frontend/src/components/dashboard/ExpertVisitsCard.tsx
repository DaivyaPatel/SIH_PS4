import { useNavigate } from 'react-router-dom';
import { UserCheck, ArrowRight } from 'lucide-react';
import type { CaseSummary } from '../../types/domain';
import { StatusChip } from '../common/StatusChip';
import { DeadlineChip } from '../common/DeadlineChip';
import { Button } from '../common/Button';

interface ExpertVisitsCardProps {
  evcCases: CaseSummary[];
}

export function ExpertVisitsCard({ evcCases }: ExpertVisitsCardProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '22px 24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--accent-subtle)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserCheck size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Assigned Expert Inspection Committee Roster
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
              Institutional campus visits scheduled for Expert Visit Committee (EVC) verification
            </p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => navigate('/visits')} rightIcon={<ArrowRight size={13} />}>
          Expert Pool Directory
        </Button>
      </div>

      {evcCases.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
          No pending EVC campus inspections assigned to your committee window.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {evcCases.map(c => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', fontSize: 12 }}>
                    {c.applicationNumber}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'var(--bg-subtle)' }}>
                    Region {c.region}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginTop: 2 }}>
                  {c.institutionName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {c.institutionType.replace(/_/g, ' ')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusChip status={c.status} size="sm" />
                <DeadlineChip
                  isOverdue={c.isOverdue}
                  remainingHours={c.remainingHours}
                  remainingBusinessDays={c.remainingBusinessDays}
                  deadlineStatus={c.deadlineStatus}
                  deadlineAtIst={c.deadlineAtIst}
                  size="sm"
                />
                <Button size="sm" variant="secondary">
                  Inspect Dossier
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
