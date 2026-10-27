import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ExecutiveKpiStrip } from './ExecutiveKpiStrip';
import { PipelineFunnelChart } from './PipelineFunnelChart';
import { RegulatoryClockBar } from './RegulatoryClockBar';
import { NeedsAttentionQueue } from './NeedsAttentionQueue';
import { InstitutionDashboardCard } from './InstitutionDashboardCard';
import { ExpertVisitsCard } from './ExpertVisitsCard';
import type { DashboardSummary, CaseSummary } from '../../types/domain';

const mockSummary: DashboardSummary = {
  academicYear: '2026-27',
  filteredRegion: 'WRO',
  kpiCards: {
    totalColleges: 154,
    pendingScrutiny: 38,
    openDeficiencies: 12,
    scheduledInspections: 24,
    approvedCount: 68,
    rejectedCount: 12,
    criticalEscalations: 5,
    averageReadinessScore: 76.4,
  },
  compliance: {
    totalCases: 154,
    cleanCases: 104,
    deficiencyFlaggedCases: 38,
    deficiencyResubmittedCases: 12,
    totalOpenDeficiencies: 28,
    totalResolvedDeficiencies: 92,
    overallComplianceRate: 82.5,
  },
  evc: {
    pendingScheduling: 14,
    scheduledVisits: 24,
    completedVisits: 18,
    totalActiveExperts: 120,
    defaultCommitteeSize: 3,
  },
  clocks: {
    onTrack: 110,
    approachingDeadline: 32,
    overdueBreached: 12,
    totalEscalationsDispatched: 5,
  },
  statusDistribution: {
    SUBMITTED: 20,
    UNDER_SCRUTINY: 38,
    DEFICIENCY_FLAGGED: 12,
    DEFICIENCY_RESUBMITTED: 6,
    EVC_PENDING: 10,
    EVC_SCHEDULED: 14,
    APPROVED: 42,
    REJECTED: 12,
  },
  regionalDistribution: {
    WRO: 154,
  },
  generatedAt: '2026-10-27T10:00:00Z',
};

const mockCases: CaseSummary[] = [
  {
    id: 'c-1',
    applicationNumber: 'AICTE-2026-ENG-001',
    institutionCode: 'INST-001',
    institutionName: 'Apex Institute of Technology',
    institutionType: 'ENGINEERING_COLLEGE',
    region: 'WRO',
    academicYear: '2026-27',
    applicationType: 'NEW_INSTITUTE',
    status: 'UNDER_SCRUTINY',
    currentStage: 'SCRUTINY',
    readinessScore: 78,
    assignedOfficer: 'Dr. Sharma',
    deadlineAt: '2026-11-15T18:30:00Z',
    submittedAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-20T14:00:00Z',
    isOverdue: false,
    remainingHours: 120,
    remainingBusinessDays: 5,
    deadlineStatus: 'ON_TRACK',
    deadlineAtIst: '15-Nov-2026 06:30 PM',
  },
  {
    id: 'c-2',
    applicationNumber: 'AICTE-2026-ENG-002',
    institutionCode: 'INST-002',
    institutionName: 'National Polytechnic College',
    institutionType: 'POLYTECHNIC',
    region: 'SRO',
    academicYear: '2026-27',
    applicationType: 'EXTENSION_OF_APPROVAL',
    status: 'DEFICIENCY_FLAGGED',
    currentStage: 'DEFICIENCY',
    readinessScore: 42,
    assignedOfficer: 'Smt. Verma',
    deadlineAt: '2026-10-25T18:30:00Z',
    submittedAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-10-22T11:00:00Z',
    isOverdue: true,
    remainingHours: -72,
    remainingBusinessDays: 0,
    deadlineStatus: 'OVERDUE',
    deadlineAtIst: '25-Oct-2026 06:30 PM',
  },
];

describe('Phase 2 - Executive Dashboard & Analytics Components', () => {
  it('renders ExecutiveKpiStrip with all 8 metrics and active alerts', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ExecutiveKpiStrip summary={mockSummary} role="REGIONAL_OFFICER" />
      </MemoryRouter>
    );

    expect(html).toContain('Total Colleges');
    expect(html).toContain('154');
    expect(html).toContain('Pending Scrutiny');
    expect(html).toContain('38');
    expect(html).toContain('Open Deficiencies');
    expect(html).toContain('12');
    expect(html).toContain('Scheduled Visits');
    expect(html).toContain('24');
    expect(html).toContain('Approved');
    expect(html).toContain('68');
    expect(html).toContain('Critical Escalations');
    expect(html).toContain('5');
    expect(html).toContain('Average Readiness');
    expect(html).toContain('76%');
  });

  it('renders PipelineFunnelChart aggregating cases across statutory stages', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <PipelineFunnelChart summary={mockSummary} />
      </MemoryRouter>
    );

    expect(html).toContain('Pipeline Stage Funnel');
    expect(html).toContain('Stage 1: Intake &amp; Registration');
    expect(html).toContain('Stage 2: Scrutiny Committee');
    expect(html).toContain('Stage 3: Institutional Deficiency Cure');
    expect(html).toContain('Stage 4: Expert Visit Committee (EVC)');
    expect(html).toContain('Stage 5: Final Decision (Approved / Rejected)');
  });

  it('renders RegulatoryClockBar with stacked health segments and escalation notifications', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RegulatoryClockBar summary={mockSummary} />
      </MemoryRouter>
    );

    expect(html).toContain('Regulatory Clock Health');
    expect(html).toContain('On Track');
    expect(html).toContain('110');
    expect(html).toContain('Approaching Deadline');
    expect(html).toContain('32');
    expect(html).toContain('Overdue / Breached');
    expect(html).toContain('12');
    expect(html).toContain('5 Statutory Escalations Dispatched to Officers');
  });

  it('renders NeedsAttentionQueue prioritizing overdue and imminent deadline cases', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <NeedsAttentionQueue cases={mockCases} role="REGIONAL_OFFICER" />
      </MemoryRouter>
    );

    expect(html).toContain('Statutory Escalations &amp; Priority Queue');
    expect(html).toContain('National Polytechnic College');
    expect(html).toContain('AICTE-2026-ENG-002');
    expect(html).toContain('3d overdue');
  });

  it('renders InstitutionDashboardCard for Institution Admin with application stepper', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <InstitutionDashboardCard primaryCase={mockCases[0]} />
      </MemoryRouter>
    );

    expect(html).toContain('Apex Institute of Technology');
    expect(html).toContain('AICTE-2026-ENG-001');
    expect(html).toContain('Institutional Application Portal');
    expect(html).toContain('1. Intake');
    expect(html).toContain('2. Scrutiny');
    expect(html).toContain('Open Application Workspace');
  });

  it('renders ExpertVisitsCard for EVC Expert with committee roster details', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ExpertVisitsCard evcCases={mockCases} />
      </MemoryRouter>
    );

    expect(html).toContain('Assigned Expert Inspection Committee Roster');
    expect(html).toContain('Apex Institute of Technology');
    expect(html).toContain('Expert Pool Directory');
  });
});
