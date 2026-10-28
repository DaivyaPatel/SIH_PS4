import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock } from 'lucide-react';
import { deriveCaseState, type CaseDerivedState } from '../../lib/caseLogic';
import { StageStepper } from './StageStepper';
import { StatusChip } from './StatusChip';
import { useDensity } from '../../context/DensityContext';
import type { CaseSummary } from '../../types/domain';

interface OfficerCaseTableProps {
  cases: CaseSummary[];
  onSelectCase: (c: CaseSummary, originElement?: HTMLElement | null) => void;
  selectedCaseId?: string | null;
  emptyMessage?: string;
  isQuieterSection?: boolean;
}

export function OfficerCaseTable({
  cases,
  onSelectCase,
  selectedCaseId,
  emptyMessage = 'Nothing needs your action.',
  isQuieterSection = false,
}: OfficerCaseTableProps) {
  const navigate = useNavigate();
  const { density } = useDensity();
  const [activeRowIdx, setActiveRowIdx] = useState<number>(0);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

  const derivedList: Array<{ summary: CaseSummary; derived: CaseDerivedState }> = cases.map(c => ({
    summary: c,
    derived: deriveCaseState(c),
  }));

  // Handle arrow key navigation between rows and Enter to open side panel
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (cases.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = Math.min(cases.length - 1, activeRowIdx + 1);
      setActiveRowIdx(nextIdx);
      rowRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = Math.max(0, activeRowIdx - 1);
      setActiveRowIdx(prevIdx);
      rowRefs.current[prevIdx]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = cases[activeRowIdx];
      if (target) {
        onSelectCase(target, rowRefs.current[activeRowIdx]);
      }
    }
  };

  if (cases.length === 0) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        <div>{emptyMessage}</div>
        <button
          onClick={() => navigate('/cases')}
          style={{
            marginTop: 8,
            background: 'none',
            border: 0,
            color: 'var(--accent)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          View all cases
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto', maxHeight: '70vh' }}>
        <table
          className={density === 'compact' ? 'density-compact' : 'density-comfortable'}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label="Officer case queue table"
          style={{ outline: 'none' }}
        >
          <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-subtle)', zIndex: 10 }}>
            <tr>
              <th scope="col" style={{ width: '24%' }}>Case</th>
              <th scope="col" style={{ width: '8%' }}>Region</th>
              <th scope="col" style={{ width: '16%' }}>Stage</th>
              <th scope="col" style={{ width: '14%' }}>Status</th>
              <th scope="col" style={{ width: '12%' }}>Waiting on</th>
              <th scope="col" style={{ width: '14%' }}>Due</th>
              <th scope="col" style={{ width: '12%', textAlign: 'right' }}>Readiness</th>
              {!isQuieterSection && <th scope="col" style={{ width: '10%', textAlign: 'right' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {derivedList.map(({ summary, derived }, idx) => {
              const isSelected = selectedCaseId === summary.id;
              const isFirstAction = idx === 0 && derived.needsOfficerAction && !isQuieterSection;

              return (
                <tr
                  key={summary.id}
                  ref={el => { rowRefs.current[idx] = el; }}
                  tabIndex={0}
                  onClick={() => onSelectCase(summary, rowRefs.current[idx])}
                  onFocus={() => setActiveRowIdx(idx)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected
                      ? 'var(--bg-subtle)'
                      : derived.clockState === 'overdue'
                      ? 'var(--status-bad-tint)'
                      : 'transparent',
                    borderLeft: isSelected
                      ? '2px solid var(--accent)'
                      : derived.clockState === 'overdue'
                      ? '2px solid var(--status-bad)'
                      : '2px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected && derived.clockState !== 'overdue') {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected && derived.clockState !== 'overdue') {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Case Monospace ID + College Name */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>
                        {summary.applicationNumber}
                      </span>
                      <span
                        title={summary.institutionName}
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 240,
                          marginTop: 2,
                        }}
                      >
                        {summary.institutionName}
                      </span>
                    </div>
                  </td>

                  {/* Region */}
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {derived.region}
                    </span>
                  </td>

                  {/* Stage Stepper */}
                  <td>
                    <StageStepper status={summary.status} hasDeficiencyWarning={derived.hasDeficiencyWarning} />
                  </td>

                  {/* Status */}
                  <td>
                    <StatusChip status={summary.status} />
                  </td>

                  {/* Waiting On (College / You / Committee) */}
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: derived.needsOfficerAction ? 600 : 400,
                        color: derived.needsOfficerAction ? 'var(--accent)' : 'var(--text-secondary)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {derived.ballInCourt === 'officer' ? 'You' : derived.ballInCourt}
                    </span>
                  </td>

                  {/* Due (Absolute date + countdown) */}
                  <td>
                    {derived.isClosed ? (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Decided</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: derived.clockState === 'overdue' ? 'var(--status-bad-text)' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {derived.clockState === 'overdue' && <AlertTriangle size={12} style={{ color: 'var(--status-bad)' }} />}
                          {derived.clockState === 'due_soon' && <Clock size={12} style={{ color: 'var(--status-warn)' }} />}
                          <span>{derived.nextDeadlineIst.split(',')[0]}</span>
                        </span>
                        <span className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {derived.relativeTimeText}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Readiness (Number + thin 4px bar, right-aligned) */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <span className="tabular-nums" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {summary.readinessScore}%
                      </span>
                      <div style={{ width: 48, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${summary.readinessScore}%`,
                            background: summary.readinessScore >= 80 ? 'var(--status-ok)' : summary.readinessScore >= 50 ? 'var(--status-warn)' : 'var(--status-bad)',
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Action Button: Exactly ONE filled primary button across the page */}
                  {!isQuieterSection && (
                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/cases/${summary.id}`)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: density === 'compact' ? '3px 8px' : '5px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: isFirstAction ? 'var(--accent)' : 'var(--bg-surface)',
                          color: isFirstAction ? 'var(--text-inverse)' : 'var(--text-primary)',
                          border: isFirstAction ? '1px solid var(--accent)' : '1px solid var(--border-strong)',
                        }}
                      >
                        {derived.actionLabel}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
