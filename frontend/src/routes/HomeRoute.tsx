import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw, AlertTriangle, Clock, X, ChevronDown, ChevronRight, Network } from 'lucide-react';
import { getCases, getCaseById } from '../lib/api';
import { useRole } from '../context/RoleContext';
import { computeUnifiedMetrics, deriveCaseState, verifyDataConsistency, type ClockState } from '../lib/caseLogic';
import { OfficerCaseTable } from '../components/common/OfficerCaseTable';
import { CaseSidePanel } from '../components/common/CaseSidePanel';
import { EscalationBanner } from '../components/common/EscalationBanner';
import { RelationshipGraphCanvas } from '../components/graph/RelationshipGraphCanvas';
import { buildGraphDataFromCase } from '../lib/graphData';
import type { CaseSummary, CaseDetail } from '../types/domain';

type ActiveSummaryFilter = 'overdue' | 'due_soon' | 'waiting_you' | 'waiting_others' | null;

export function HomeRoute() {
  const { permissions } = useRole();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseIdFromUrl = searchParams.get('caseId');

  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedTime, setUpdatedTime] = useState<string>('');

  // Filters state
  const [summaryFilter, setSummaryFilter] = useState<ActiveSummaryFilter>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [waitingFilter, setWaitingFilter] = useState<string>('ALL');
  const [savedView, setSavedView] = useState<string>('MY_QUEUE');

  // Secondary section collapsed state
  const [otherCasesOpen, setOtherCasesOpen] = useState(false);

  // Side panel state
  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);
  const [originEl, setOriginEl] = useState<HTMLElement | null>(null);

  // 2D Topology Graph state
  const [graphCaseId, setGraphCaseId] = useState<string>('');
  const [graphCaseDetail, setGraphCaseDetail] = useState<CaseDetail | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [showGraph, setShowGraph] = useState(true);

  useEffect(() => {
    if (caseIdFromUrl && cases.length > 0) {
      const match = cases.find(c => c.id === caseIdFromUrl || c.applicationNumber === caseIdFromUrl);
      if (match) setSelectedCase(match);
    }
  }, [caseIdFromUrl, cases]);

  const loadData = () => {
    setLoading(true);
    setError(null);

    getCases('ALL', 'ALL')
      .then(res => {
        setCases(res);
        setLoading(false);
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        setUpdatedTime(`${hh}:${mm}`);

        // Dev-only data consistency check
        if (process.env.NODE_ENV !== 'production') {
          const errors = verifyDataConsistency(res);
          if (errors.length > 0) {
            console.warn('[Consistency Check Failed]', errors);
          }
        }
      })
      .catch((err: Error) => {
        setError(err.message || 'Unable to retrieve cases queue.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Shared single source of truth metrics
  const metrics = useMemo(() => {
    return computeUnifiedMetrics(cases);
  }, [cases]);

  // Derived state mapping
  const derivedMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof deriveCaseState>>();
    for (const c of cases) {
      map.set(c.id, deriveCaseState(c));
    }
    return map;
  }, [cases]);

  // Handle saved view selection
  const handleSavedViewChange = (view: string) => {
    setSavedView(view);
    setSummaryFilter(null);
    setSearchQuery('');
    setRegionFilter('ALL');

    if (view === 'MY_QUEUE') {
      setStageFilter('ALL');
      setWaitingFilter('ALL');
    } else if (view === 'DUE_THIS_WEEK') {
      setStageFilter('ALL');
      setWaitingFilter('ALL');
      setSummaryFilter('due_soon');
    } else if (view === 'DEFICIENCIES') {
      setStageFilter('Cure');
      setWaitingFilter('ALL');
    } else if (view === 'EVC_PENDING') {
      setStageFilter('EVC Visit');
      setWaitingFilter('ALL');
    }
  };

  // Filter cases logic
  const filterCase = (c: CaseSummary) => {
    const d = derivedMap.get(c.id);
    if (!d) return false;

    // Summary strip filter
    if (summaryFilter === 'overdue' && d.clockState !== 'overdue') return false;
    if (summaryFilter === 'due_soon' && d.clockState !== 'due_soon') return false;
    if (summaryFilter === 'waiting_you' && !d.needsOfficerAction) return false;
    if (summaryFilter === 'waiting_others' && d.needsOfficerAction) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.applicationNumber.toLowerCase().includes(q);
      const matchName = c.institutionName.toLowerCase().includes(q);
      if (!matchNum && !matchName) return false;
    }

    // Region
    if (regionFilter !== 'ALL' && d.region !== regionFilter) return false;

    // Stage
    if (stageFilter !== 'ALL' && d.stageName !== stageFilter) return false;

    // Waiting on
    if (waitingFilter !== 'ALL') {
      if (waitingFilter === 'YOU' && d.ballInCourt !== 'officer') return false;
      if (waitingFilter === 'COLLEGE' && d.ballInCourt !== 'college') return false;
      if (waitingFilter === 'COMMITTEE' && d.ballInCourt !== 'committee') return false;
    }

    return true;
  };

  // Sort by urgency: overdue -> due_soon -> on_track, then remainingHours ascending
  const sortByUrgency = (a: CaseSummary, b: CaseSummary) => {
    const da = derivedMap.get(a.id);
    const db = derivedMap.get(b.id);
    if (!da || !db) return 0;

    const rank = (state: ClockState) => {
      if (state === 'overdue') return 0;
      if (state === 'due_soon') return 1;
      if (state === 'on_track') return 2;
      return 3;
    };

    const rankDiff = rank(da.clockState) - rank(db.clockState);
    if (rankDiff !== 0) return rankDiff;

    return da.remainingHours - db.remainingHours;
  };

  // Action Queue: only cases where needsOfficerAction === true (and not closed)
  const actionCases = useMemo(() => {
    return cases
      .filter(c => {
        const d = derivedMap.get(c.id);
        return d && d.needsOfficerAction && !d.isClosed && filterCase(c);
      })
      .sort(sortByUrgency);
  }, [cases, derivedMap, summaryFilter, searchQuery, regionFilter, stageFilter, waitingFilter]);

  // Other Active Cases: active cases waiting on college or committee
  const otherCases = useMemo(() => {
    return cases
      .filter(c => {
        const d = derivedMap.get(c.id);
        return d && !d.needsOfficerAction && !d.isClosed && filterCase(c);
      })
      .sort(sortByUrgency);
  }, [cases, derivedMap, summaryFilter, searchQuery, regionFilter, stageFilter, waitingFilter]);

  // Sync 2D graph case data
  useEffect(() => {
    const targetId = graphCaseId || actionCases[0]?.id || cases[0]?.id;
    if (!targetId) return;

    if (!graphCaseId) {
      setGraphCaseId(targetId);
    }

    setLoadingGraph(true);
    getCaseById(targetId)
      .then(d => {
        setGraphCaseDetail(d);
        setLoadingGraph(false);
      })
      .catch(() => setLoadingGraph(false));
  }, [graphCaseId, cases, actionCases]);

  const graphData = useMemo(() => {
    if (!graphCaseDetail) return null;
    return buildGraphDataFromCase(graphCaseDetail);
  }, [graphCaseDetail]);

  const activeFiltersCount =
    (summaryFilter ? 1 : 0) +
    (regionFilter !== 'ALL' ? 1 : 0) +
    (stageFilter !== 'ALL' ? 1 : 0) +
    (waitingFilter !== 'ALL' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const clearFilters = () => {
    setSummaryFilter(null);
    setSearchQuery('');
    setRegionFilter('ALL');
    setStageFilter('ALL');
    setWaitingFilter('ALL');
    setSavedView('MY_QUEUE');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Header: Page title, context, refresh with time */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Your queue
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            {permissions.roleDisplayName} · Academic Year 2026-27
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={loadData}
            aria-label="Refresh cases queue"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              fontSize: 12,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : undefined} />
            <span aria-live="polite" className="tabular-nums" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Updated {updatedTime || '--:--'}
            </span>
          </button>
        </div>
      </div>

      {/* Error alert if load fails */}
      {error && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            background: 'var(--status-bad-tint)',
            color: 'var(--status-bad-text)',
            border: '1px solid var(--status-bad-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Escalation Banner (rendered only if at least one case is overdue) */}
      <EscalationBanner overdueCases={metrics.lists.overdue} />

      {/* 2. Summary Strip: 4 flat clickable filter counts */}
      <div
        role="region"
        aria-label="Queue summary counts"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
        }}
      >
        {/* Count 1: Overdue */}
        <button
          onClick={() => setSummaryFilter(prev => (prev === 'overdue' ? null : 'overdue'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            border: 0,
            background: summaryFilter === 'overdue' ? 'var(--bg-subtle)' : 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span
            className="tabular-nums"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: metrics.counts.overdue > 0 ? 'var(--status-bad-text)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {metrics.counts.overdue > 0 && <AlertTriangle size={14} style={{ color: 'var(--status-bad)' }} />}
            {metrics.counts.overdue}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Overdue</span>
        </button>

        {/* Count 2: Due in 48 hours */}
        <button
          onClick={() => setSummaryFilter(prev => (prev === 'due_soon' ? null : 'due_soon'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            border: 0,
            background: summaryFilter === 'due_soon' ? 'var(--bg-subtle)' : 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span
            className="tabular-nums"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: metrics.counts.dueSoon > 0 ? 'var(--status-warn-text)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {metrics.counts.dueSoon > 0 && <Clock size={14} style={{ color: 'var(--status-warn)' }} />}
            {metrics.counts.dueSoon}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due in 48 hours</span>
        </button>

        {/* Count 3: Waiting on you */}
        <button
          onClick={() => setSummaryFilter(prev => (prev === 'waiting_you' ? null : 'waiting_you'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            border: 0,
            background: summaryFilter === 'waiting_you' ? 'var(--bg-subtle)' : 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span className="tabular-nums" style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>
            {metrics.counts.waitingOnYou}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting on you</span>
        </button>

        {/* Count 4: Waiting on college / committee */}
        <button
          onClick={() => setSummaryFilter(prev => (prev === 'waiting_others' ? null : 'waiting_others'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            border: 0,
            background: summaryFilter === 'waiting_others' ? 'var(--bg-subtle)' : 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span className="tabular-nums" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            {metrics.counts.waitingOnOthers}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting on college/committee</span>
        </button>
      </div>

      {/* 3. Filter Row above table */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Search-in-table */}
          <input
            type="text"
            placeholder="Filter table rows…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 12,
              width: 170,
            }}
          />

          {/* Region filter */}
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            aria-label="Filter by region"
            style={{
              padding: '4px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Regions</option>
            <option value="WRO">WRO (Western)</option>
            <option value="SRO">SRO (Southern)</option>
            <option value="NRO">NRO (Northern)</option>
            <option value="ERO">ERO (Eastern)</option>
            <option value="CRO">CRO (Central)</option>
          </select>

          {/* Stage filter */}
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            aria-label="Filter by stage"
            style={{
              padding: '4px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Stages</option>
            <option value="Intake">1. Intake</option>
            <option value="Scrutiny">2. Scrutiny</option>
            <option value="Cure">3. Cure</option>
            <option value="EVC Visit">4. EVC Visit</option>
            <option value="Decision">5. Decision</option>
          </select>

          {/* Waiting on filter */}
          <select
            value={waitingFilter}
            onChange={e => setWaitingFilter(e.target.value)}
            aria-label="Filter by waiting on"
            style={{
              padding: '4px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Responsibility</option>
            <option value="YOU">Waiting on You</option>
            <option value="COLLEGE">Waiting on College</option>
            <option value="COMMITTEE">Waiting on Committee</option>
          </select>

          {/* Saved Views Dropdown */}
          <select
            value={savedView}
            onChange={e => handleSavedViewChange(e.target.value)}
            aria-label="Saved views"
            style={{
              padding: '4px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <option value="MY_QUEUE">View: My queue</option>
            <option value="DUE_THIS_WEEK">View: Due this week</option>
            <option value="DEFICIENCIES">View: Deficiencies</option>
            <option value="EVC_PENDING">View: EVC pending</option>
          </select>

          {/* Removable chips if active filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-muted)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              <span>Clear filters ({activeFiltersCount})</span>
              <X size={11} />
            </button>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{actionCases.length}</strong> action items
        </div>
      </div>

      {/* 4. Main Table: Needs your action */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Needs your action
          </h2>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Sorted by urgency · Exactly one primary filled action
          </span>
        </div>

        <OfficerCaseTable
          cases={actionCases}
          onSelectCase={(c, el) => {
            setSelectedCase(c);
            setOriginEl(el || null);
            setGraphCaseId(c.id);
          }}
          selectedCaseId={selectedCase?.id}
          emptyMessage="Nothing needs your action."
        />
      </section>

      {/* 5. Secondary Section: Other active cases (collapsed by default) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        <div
          onClick={() => setOtherCasesOpen(!otherCasesOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {otherCasesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Other active cases ({otherCases.length})
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              — Waiting on college response or expert committee on-site inspection
            </span>
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              navigate('/cases');
            }}
            style={{
              background: 'none',
              border: 0,
              color: 'var(--accent)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            View all cases →
          </button>
        </div>

        {otherCasesOpen && (
          <OfficerCaseTable
            cases={otherCases}
            onSelectCase={(c, el) => {
              setSelectedCase(c);
              setOriginEl(el || null);
              setGraphCaseId(c.id);
            }}
            selectedCaseId={selectedCase?.id}
            emptyMessage="No other active cases waiting on external parties."
            isQuieterSection={true}
          />
        )}
      </section>

      {/* 6. 2D Topological Relationship Graph */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            padding: '8px 12px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Network size={16} style={{ color: 'var(--accent)' }} />
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Topological Relationship Graph (2D Compliance Topology)
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                — 5-column statutory chain tracing regulatory evidence to decision
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="graph-case-select" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Application:
            </label>
            <select
              id="graph-case-select"
              value={graphCaseId}
              onChange={e => setGraphCaseId(e.target.value)}
              aria-label="Select application for 2D relationship graph"
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                maxWidth: 280,
              }}
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.applicationNumber} — {c.institutionName}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowGraph(!showGraph)}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {showGraph ? 'Hide Graph ▴' : 'Show Graph ▾'}
            </button>
          </div>
        </div>

        {showGraph && graphData && (
          <RelationshipGraphCanvas
            data={graphData}
            height={480}
            title={`Topological Relationship Graph — ${graphCaseDetail?.applicationNumber}`}
            subtitle={`Tracing statutory compliance neighbourhood for ${graphCaseDetail?.institution.name}`}
            onRefresh={loadData}
          />
        )}

        {showGraph && !graphData && loadingGraph && (
          <div
            style={{
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: 12,
            }}
          >
            Loading 2D topological graph…
          </div>
        )}
      </section>

      {/* Side Panel for Selected Case */}
      <CaseSidePanel
        caseSummary={selectedCase}
        onClose={() => setSelectedCase(null)}
        originatingElement={originEl}
      />
    </div>
  );
}
