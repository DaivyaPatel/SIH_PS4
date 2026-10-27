import { Building, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import type { ExpertDetail } from '../../types/domain';

interface ExpertCardProps {
  expert: ExpertDetail;
  onSelect: (expert: ExpertDetail) => void;
}

export function ExpertCard({ expert, onSelect }: ExpertCardProps) {
  const conflictsCount = Array.isArray(expert.conflictInstitutions)
    ? expert.conflictInstitutions.length
    : expert.conflictInstitutions
    ? expert.conflictInstitutions.split(',').filter(Boolean).length
    : 0;

  const nextAvailable = expert.availableDates[0];

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Top row: Name & Region */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
            {expert.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.3 }}>
            {expert.designation}
          </div>
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          {expert.region}
        </span>
      </div>

      {/* Affiliation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
        <Building size={13} style={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {expert.affiliatedInstitution}
        </span>
      </div>

      {/* Domain Chip & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            background: 'var(--accent-subtle)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
          }}
        >
          {expert.domain.replace(/_/g, ' ')}
        </span>

        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: 4,
            background: expert.active ? 'var(--status-ok-tint)' : 'var(--bg-hover)',
            color: expert.active ? 'var(--status-ok-text)' : 'var(--text-muted)',
          }}
        >
          {expert.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>

      {/* Footer Info: Next Availability & Conflicts */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          borderTop: '1px solid var(--border)',
          paddingTop: 10,
          marginTop: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
          <Calendar size={12} />
          <span>{nextAvailable ? nextAvailable : 'No dates'}</span>
        </div>

        {conflictsCount > 0 ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              color: 'var(--status-warn-text)',
              background: 'var(--status-warn-tint)',
              padding: '1px 5px',
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={10} />
            {conflictsCount} conflict{conflictsCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span style={{ color: 'var(--status-ok-text)', fontWeight: 600 }}>
            0 conflicts
          </span>
        )}
      </div>

      {/* Action Button */}
      <Button
        variant="ghost"
        size="sm"
        rightIcon={<ArrowRight size={12} />}
        onClick={() => onSelect(expert)}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        View Profile &amp; Availability
      </Button>
    </div>
  );
}
