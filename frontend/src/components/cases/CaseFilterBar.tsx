import React from 'react';
import { Search, SlidersHorizontal, Table, LayoutGrid, Download, X } from 'lucide-react';
import type { Region, CaseStatus } from '../../types/domain';
import { Button } from '../common/Button';

export interface CaseFilterState {
  search: string;
  stage: string;
  region: string;
  deadlineStatus: string;
  readinessTier: string;
}

interface CaseFilterBarProps {
  filters: CaseFilterState;
  onFilterChange: (filters: CaseFilterState) => void;
  viewMode: 'table' | 'board';
  onViewModeChange: (mode: 'table' | 'board') => void;
  density: 'comfortable' | 'compact';
  onDensityChange: (density: 'comfortable' | 'compact') => void;
  onExportCsv: () => void;
  totalCount: number;
  filteredCount: number;
}

export function CaseFilterBar({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  density,
  onDensityChange,
  onExportCsv,
  totalCount,
  filteredCount,
}: CaseFilterBarProps) {
  const regions: Array<Region | 'ALL'> = ['ALL', 'WRO', 'SRO', 'NRO', 'ERO', 'CRO'];

  const stages: Array<{ key: string; label: string }> = [
    { key: 'ALL', label: 'All Stages' },
    { key: 'INTAKE', label: 'Intake' },
    { key: 'UNDER_SCRUTINY', label: 'Under Scrutiny' },
    { key: 'DEFICIENCY_FLAGGED', label: 'Deficiency Flagged' },
    { key: 'EVC_PENDING', label: 'EVC Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  const deadlineOptions = [
    { key: 'ALL', label: 'All Deadlines' },
    { key: 'ON_TRACK', label: 'On Track' },
    { key: 'APPROACHING_DEADLINE', label: 'Approaching Deadline' },
    { key: 'OVERDUE', label: 'Overdue' },
  ];

  const readinessTiers = [
    { key: 'ALL', label: 'All Readiness Tiers' },
    { key: 'FULLY_COMPLIANT', label: 'Fully Compliant (>=85%)' },
    { key: 'NEAR_READY', label: 'Near Ready (70-84%)' },
    { key: 'NEEDS_ATTENTION', label: 'Needs Attention (50-69%)' },
    { key: 'CRITICAL_DEFICIT', label: 'Critical Deficit (<50%)' },
  ];

  const isFiltered =
    Boolean(filters.search) ||
    filters.stage !== 'ALL' ||
    filters.region !== 'ALL' ||
    filters.deadlineStatus !== 'ALL' ||
    filters.readinessTier !== 'ALL';

  const resetFilters = () => {
    onFilterChange({
      search: '',
      stage: 'ALL',
      region: 'ALL',
      deadlineStatus: 'ALL',
      readinessTier: 'ALL',
    });
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '14px 16px',
        marginBottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Search and Primary Controls Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search by application no. or college name…"
            value={filters.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 2,
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Toggle (Table / Board) and Density */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-subtle)',
              padding: 2,
              borderRadius: 6,
              border: '1px solid var(--border)',
            }}
          >
            <button
              onClick={() => onViewModeChange('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: viewMode === 'table' ? 600 : 400,
                background: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'table' ? 'var(--accent)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Table size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => onViewModeChange('board')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: viewMode === 'board' ? 600 : 400,
                background: viewMode === 'board' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'board' ? 'var(--accent)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'board' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <LayoutGrid size={14} />
              <span>Board</span>
            </button>
          </div>

          {viewMode === 'table' && (
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-subtle)',
                padding: 2,
                borderRadius: 6,
                border: '1px solid var(--border)',
              }}
            >
              <button
                onClick={() => onDensityChange('comfortable')}
                style={{
                  padding: '5px 8px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: density === 'comfortable' ? 600 : 400,
                  background: density === 'comfortable' ? 'var(--bg-surface)' : 'transparent',
                  color: density === 'comfortable' ? 'var(--accent)' : 'var(--text-secondary)',
                }}
                title="Comfortable row height"
              >
                Comfortable
              </button>
              <button
                onClick={() => onDensityChange('compact')}
                style={{
                  padding: '5px 8px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: density === 'compact' ? 600 : 400,
                  background: density === 'compact' ? 'var(--bg-surface)' : 'transparent',
                  color: density === 'compact' ? 'var(--accent)' : 'var(--text-secondary)',
                }}
                title="Dense compact row height"
              >
                Compact
              </button>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCsv}
            leftIcon={<Download size={13} />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Dropdowns Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          paddingTop: 4,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 12 }}>
          <SlidersHorizontal size={14} />
          <span>Filters:</span>
        </div>

        {/* Stage Filter */}
        <select
          value={filters.stage}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onFilterChange({ ...filters, stage: e.target.value as CaseStatus | 'ALL' })
          }
          style={{
            padding: '5px 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            fontSize: 12,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {stages.map(s => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Region Filter */}
        <select
          value={filters.region}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onFilterChange({ ...filters, region: e.target.value })
          }
          style={{
            padding: '5px 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            fontSize: 12,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {regions.map(r => (
            <option key={r} value={r}>
              {r === 'ALL' ? 'All Regions' : `Region ${r}`}
            </option>
          ))}
        </select>

        {/* Deadline Status Filter */}
        <select
          value={filters.deadlineStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onFilterChange({ ...filters, deadlineStatus: e.target.value })
          }
          style={{
            padding: '5px 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            fontSize: 12,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {deadlineOptions.map(d => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </select>

        {/* Readiness Tier Filter */}
        <select
          value={filters.readinessTier}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onFilterChange({ ...filters, readinessTier: e.target.value })
          }
          style={{
            padding: '5px 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            fontSize: 12,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {readinessTiers.map(rt => (
            <option key={rt.key} value={rt.key}>
              {rt.label}
            </option>
          ))}
        </select>

        {/* Filter Summary & Reset Button */}
        {isFiltered && (
          <button
            onClick={resetFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px dashed var(--border)',
              background: 'transparent',
              color: 'var(--accent)',
              fontSize: 12,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            <X size={12} />
            <span>Reset filters</span>
          </button>
        )}

        <div
          className="tabular-nums"
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginLeft: isFiltered ? 8 : 'auto',
          }}
        >
          Showing <strong>{filteredCount}</strong> of {totalCount} cases
        </div>
      </div>
    </div>
  );
}
