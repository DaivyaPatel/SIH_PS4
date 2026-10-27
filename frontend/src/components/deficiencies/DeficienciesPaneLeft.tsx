import { useState, useMemo } from 'react';
import { Search, AlertTriangle, Clock } from 'lucide-react';
import { DeadlineChip } from '../common/DeadlineChip';
import type { CaseSummary } from '../../types/domain';

export interface CaseDeficiencyMeta extends CaseSummary {
  openCount: number;
  resubmittedCount: number;
  resolvedCount: number;
  totalDeficiencies: number;
}

interface DeficienciesPaneLeftProps {
  cases: CaseDeficiencyMeta[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  loading: boolean;
}

export function DeficienciesPaneLeft({
  cases,
  selectedCaseId,
  onSelectCase,
  loading,
}: DeficienciesPaneLeftProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'OPEN' | 'RESUBMITTED'>('ALL');

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch =
        c.institutionName.toLowerCase().includes(search.toLowerCase()) ||
        c.applicationNumber.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'OPEN') return c.openCount > 0;
      if (filterType === 'RESUBMITTED') return c.resubmittedCount > 0;
      return true;
    });
  }, [cases, search, filterType]);

  const totalOpen = useMemo(() => cases.reduce((acc, c) => acc + c.openCount, 0), [cases]);
  const totalResubmitted = useMemo(() => cases.reduce((acc, c) => acc + c.resubmittedCount, 0), [cases]);

  return (
    <div
      style={{
        width: 320,
        minWidth: 300,
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Pane Header */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Applications ({filteredCases.length})
          </h2>

          <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
            {totalOpen > 0 && (
              <span
                style={{
                  background: 'var(--status-bad-tint)',
                  color: 'var(--status-bad-text)',
                  border: '1px solid var(--status-bad-border)',
                  padding: '2px 6px',
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                {totalOpen} Open
              </span>
            )}
            {totalResubmitted > 0 && (
              <span
                style={{
                  background: 'var(--status-info-tint)',
                  color: 'var(--status-info-text)',
                  border: '1px solid var(--status-info-border)',
                  padding: '2px 6px',
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                {totalResubmitted} Review
              </span>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search college or application..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filter Segmented Control */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            borderRadius: 6,
            padding: 2,
            gap: 2,
          }}
        >
          {(['ALL', 'OPEN', 'RESUBMITTED'] as const).map(tab => {
            const isActive = filterType === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                style={{
                  flex: 1,
                  padding: '4px 0',
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab === 'ALL' ? 'All' : tab === 'OPEN' ? 'Open' : 'Resubmitted'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cases List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            Loading deficiency records...
          </div>
        ) : filteredCases.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            No matching applications found.
          </div>
        ) : (
          filteredCases.map(c => {
            const isSelected = c.id === selectedCaseId;

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                  border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Header row: App number & Region */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: 700,
                      color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    {c.applicationNumber}
                  </span>

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {c.region}
                  </span>
                </div>

                {/* College Name */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={c.institutionName}
                >
                  {c.institutionName}
                </div>

                {/* Status Badges & Deadline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {c.openCount > 0 && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--status-bad-text)',
                          background: 'var(--status-bad-tint)',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        <AlertTriangle size={10} />
                        {c.openCount} Open
                      </span>
                    )}

                    {c.resubmittedCount > 0 && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--status-info-text)',
                          background: 'var(--status-info-tint)',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        <Clock size={10} />
                        {c.resubmittedCount} Review
                      </span>
                    )}

                    {c.openCount === 0 && c.resubmittedCount === 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'var(--status-ok-text)',
                          background: 'var(--status-ok-tint)',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        All Cleared
                      </span>
                    )}
                  </div>

                  <DeadlineChip
                    isOverdue={c.isOverdue}
                    remainingHours={c.remainingHours}
                    remainingBusinessDays={c.remainingBusinessDays}
                    deadlineStatus={c.deadlineStatus}
                    deadlineAtIst={c.deadlineAtIst}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
