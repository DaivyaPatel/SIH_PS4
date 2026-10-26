import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, ArrowRight, Download, CheckSquare, Square, FolderSearch } from 'lucide-react';
import type { CaseSummary } from '../../types/domain';
import { StatusChip } from '../common/StatusChip';
import { DeadlineChip } from '../common/DeadlineChip';
import { ReadinessRing } from '../common/ReadinessRing';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';

export type SortField = 'applicationNumber' | 'institutionName' | 'readinessScore' | 'remainingHours';
export type SortDirection = 'asc' | 'desc';

interface CaseTableViewProps {
  cases: CaseSummary[];
  density: 'comfortable' | 'compact';
  onExportCases?: (casesToExport: CaseSummary[]) => void;
}

export function CaseTableView({ cases, density, onExportCases }: CaseTableViewProps) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('applicationNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCases = useMemo(() => {
    return [...cases].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'applicationNumber':
          comparison = a.applicationNumber.localeCompare(b.applicationNumber);
          break;
        case 'institutionName':
          comparison = a.institutionName.localeCompare(b.institutionName);
          break;
        case 'readinessScore':
          comparison = a.readinessScore - b.readinessScore;
          break;
        case 'remainingHours':
          comparison = (a.remainingHours ?? 0) - (b.remainingHours ?? 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [cases, sortField, sortDirection]);

  const allSelected = sortedCases.length > 0 && selectedIds.size === sortedCases.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedCases.map(c => c.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExportSelected = () => {
    if (!onExportCases) return;
    const selectedCases = cases.filter(c => selectedIds.has(c.id));
    onExportCases(selectedCases);
  };

  const padCell = density === 'comfortable' ? '12px 14px' : '6px 10px';
  const fontSize = density === 'comfortable' ? 13 : 12;

  if (cases.length === 0) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title="No matching cases found"
        description="Try adjusting your search criteria, stage filter, or regional jurisdiction."
      />
    );
  }

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} style={{ color: 'var(--accent)' }} />
    ) : (
      <ArrowDown size={12} style={{ color: 'var(--accent)' }} />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Bulk Action Strip */}
      {selectedIds.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent)',
            borderRadius: 6,
            padding: '8px 14px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
            {selectedIds.size} case{selectedIds.size > 1 ? 's' : ''} selected
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Download size={13} />}
              onClick={handleExportSelected}
            >
              Export Selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflowX: 'auto',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize,
          }}
        >
          <thead>
            <tr
              style={{
                background: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                userSelect: 'none',
              }}
            >
              <th style={{ padding: padCell, width: 36, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  title={allSelected ? 'Deselect all' : 'Select all'}
                >
                  {allSelected ? (
                    <CheckSquare size={16} style={{ color: 'var(--accent)' }} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>

              <th
                onClick={() => handleSort('applicationNumber')}
                style={{ padding: padCell, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Application No.</span>
                  {renderSortIndicator('applicationNumber')}
                </div>
              </th>

              <th
                onClick={() => handleSort('institutionName')}
                style={{ padding: padCell, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Institution Name</span>
                  {renderSortIndicator('institutionName')}
                </div>
              </th>

              <th style={{ padding: padCell, width: 80 }}>Region</th>
              <th style={{ padding: padCell, width: 140 }}>Stage</th>

              <th
                onClick={() => handleSort('readinessScore')}
                style={{ padding: padCell, cursor: 'pointer', width: 130 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Readiness</span>
                  {renderSortIndicator('readinessScore')}
                </div>
              </th>

              <th
                onClick={() => handleSort('remainingHours')}
                style={{ padding: padCell, cursor: 'pointer', width: 130 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Deadline</span>
                  {renderSortIndicator('remainingHours')}
                </div>
              </th>

              <th style={{ padding: padCell, width: 150 }}>Assigned Officer</th>
              <th style={{ padding: padCell, width: 44, textAlign: 'center' }}></th>
            </tr>
          </thead>

          <tbody>
            {sortedCases.map(c => {
              const isSelected = selectedIds.has(c.id);

              return (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--bg-subtle)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Select Checkbox */}
                  <td style={{ padding: padCell, textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(c.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare size={16} style={{ color: 'var(--accent)' }} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>

                  {/* Application Number */}
                  <td style={{ padding: padCell }}>
                    <button
                      onClick={() => navigate(`/cases/${c.id}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: 'var(--accent)',
                        fontSize: fontSize + 1,
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                      }}
                    >
                      {c.applicationNumber}
                    </button>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      AY {c.academicYear}
                    </div>
                  </td>

                  {/* Institution Name */}
                  <td style={{ padding: padCell }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.institutionName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {c.institutionType.replace(/_/g, ' ')} · {c.applicationType.replace(/_/g, ' ')}
                    </div>
                  </td>

                  {/* Region */}
                  <td style={{ padding: padCell }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {c.region}
                    </span>
                  </td>

                  {/* Stage */}
                  <td style={{ padding: padCell }}>
                    <StatusChip status={c.status} size="sm" />
                  </td>

                  {/* Readiness Ring */}
                  <td style={{ padding: padCell }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ReadinessRing score={c.readinessScore} size="sm" showLabel={false} />
                      <span className="tabular-nums" style={{ fontWeight: 600, fontSize: 12 }}>
                        {c.readinessScore}%
                      </span>
                    </div>
                  </td>

                  {/* Deadline */}
                  <td style={{ padding: padCell }}>
                    <DeadlineChip
                      isOverdue={c.isOverdue}
                      remainingHours={c.remainingHours}
                      remainingBusinessDays={c.remainingBusinessDays}
                      deadlineStatus={c.deadlineStatus}
                      deadlineAtIst={c.deadlineAtIst}
                      size="sm"
                    />
                  </td>

                  {/* Assigned Officer */}
                  <td style={{ padding: padCell }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'var(--accent-subtle)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {c.assignedOfficer
                          ? c.assignedOfficer
                              .split(' ')
                              .map(part => part[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()
                          : 'NA'}
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {c.assignedOfficer || 'Unassigned'}
                      </span>
                    </div>
                  </td>

                  {/* Action Link */}
                  <td style={{ padding: padCell, textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/cases/${c.id}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 4,
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Inspect case detail"
                    >
                      <ArrowRight size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
