import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCases } from '../lib/api';
import { useRegion } from '../context/RegionContext';
import { SkeletonTable } from '../components/common/Skeleton';
import { CaseFilterBar, type CaseFilterState } from '../components/cases/CaseFilterBar';
import { CaseTableView } from '../components/cases/CaseTableView';
import { CaseBoardView } from '../components/cases/CaseBoardView';
import type { CaseSummary } from '../types/domain';
import { useToast } from '../context/ToastContext';

export function CasesRoute() {
  const { selectedRegion } = useRegion();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [allCases, setAllCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View preferences
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Filter state
  const [filters, setFilters] = useState<CaseFilterState>({
    search: searchParams.get('q') || '',
    stage: searchParams.get('status') || 'ALL',
    region: selectedRegion || 'ALL',
    deadlineStatus: searchParams.get('deadline') || 'ALL',
    readinessTier: 'ALL',
  });

  // Sync with global region when it changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, region: selectedRegion }));
  }, [selectedRegion]);

  // Load cases from backend
  const loadCases = () => {
    setLoading(true);
    setError(null);

    // Call GET /api/v1/cases with stage and region filters
    getCases('ALL', 'ALL')
      .then(data => {
        setAllCases(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Unable to load applications list.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCases();
  }, []);

  // Filter cases client-side
  const filteredCases = useMemo(() => {
    return allCases.filter(c => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesAppNo = c.applicationNumber.toLowerCase().includes(q);
        const matchesInst = c.institutionName.toLowerCase().includes(q);
        if (!matchesAppNo && !matchesInst) return false;
      }

      // Stage
      if (filters.stage !== 'ALL' && c.status !== filters.stage) {
        return false;
      }

      // Region
      if (filters.region !== 'ALL' && c.region !== filters.region) {
        return false;
      }

      // Deadline Status
      if (filters.deadlineStatus !== 'ALL') {
        if (filters.deadlineStatus === 'OVERDUE' && !c.isOverdue) return false;
        if (filters.deadlineStatus === 'APPROACHING_DEADLINE' && c.deadlineStatus !== 'APPROACHING_DEADLINE')
          return false;
        if (filters.deadlineStatus === 'ON_TRACK' && c.deadlineStatus !== 'ON_TRACK') return false;
      }

      // Readiness Tier
      if (filters.readinessTier !== 'ALL') {
        const score = c.readinessScore;
        if (filters.readinessTier === 'FULLY_COMPLIANT' && score < 85) return false;
        if (filters.readinessTier === 'NEAR_READY' && (score < 70 || score >= 85)) return false;
        if (filters.readinessTier === 'NEEDS_ATTENTION' && (score < 50 || score >= 70)) return false;
        if (filters.readinessTier === 'CRITICAL_DEFICIT' && score >= 50) return false;
      }

      return true;
    });
  }, [allCases, filters]);

  // Export CSV
  const exportCasesCsv = (casesToExport: CaseSummary[]) => {
    if (casesToExport.length === 0) {
      addToast({ type: 'warning', title: 'Export Failed', message: 'No cases match current filter to export.' });
      return;
    }

    const headers = [
      'Application Number',
      'Institution Name',
      'Institution Type',
      'Region',
      'Stage',
      'Readiness Score',
      'Deadline (IST)',
      'Remaining Business Days',
      'Deadline Status',
      'Assigned Officer',
    ];

    const rows = casesToExport.map(c => [
      `"${c.applicationNumber}"`,
      `"${c.institutionName.replace(/"/g, '""')}"`,
      `"${c.institutionType}"`,
      `"${c.region}"`,
      `"${c.status}"`,
      c.readinessScore,
      `"${c.deadlineAtIst || ''}"`,
      c.remainingBusinessDays,
      `"${c.deadlineStatus}"`,
      `"${c.assignedOfficer || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aicte-cases-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Cases Exported',
      message: `Exported ${casesToExport.length} cases to CSV.`,
    });
  };

  return (
    <div>
      {/* Page Title & Breadcrumb context */}
      <div style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: '0 0 4px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Applications Workspace
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Comprehensive approval pipeline, multi-criteria filtering, and stage management.
        </p>
      </div>

      {/* Filter Toolbar */}
      <CaseFilterBar
        filters={filters}
        onFilterChange={newFilters => {
          setFilters(newFilters);
          // Sync URL search params
          const params = new URLSearchParams();
          if (newFilters.search) params.set('q', newFilters.search);
          if (newFilters.stage !== 'ALL') params.set('status', newFilters.stage);
          if (newFilters.deadlineStatus !== 'ALL') params.set('deadline', newFilters.deadlineStatus);
          setSearchParams(params);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        density={density}
        onDensityChange={setDensity}
        onExportCsv={() => exportCasesCsv(filteredCases)}
        totalCount={allCases.length}
        filteredCount={filteredCases.length}
      />

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            padding: 14,
            background: 'var(--status-bad-tint)',
            color: 'var(--status-bad-text)',
            border: '1px solid var(--status-bad-border)',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          <strong>Error loading applications:</strong> {error}
        </div>
      )}

      {/* Content: Loading Skeleton vs Views */}
      {loading ? (
        <SkeletonTable rows={8} />
      ) : viewMode === 'table' ? (
        <CaseTableView
          cases={filteredCases}
          density={density}
          onExportCases={exportCasesCsv}
        />
      ) : (
        <CaseBoardView cases={filteredCases} />
      )}
    </div>
  );
}
